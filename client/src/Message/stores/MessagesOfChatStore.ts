import {makeAutoObservable, observable, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {AxiosPromise} from "axios";
import {isAfter, isBefore} from "date-fns";
import {SearchMessagesStore} from "./SearchMessagesStore";
import {MessageRepository} from "../repositories";
import {createSortMessages} from "../utils";
import {
    ChatMessagesFetchingStateMap,
    CleanedUpMessageMetadata,
    CleanedUpMessagesMetadata,
    FetchMessagesOptions,
    MessageEntity,
    MessagesCleanupState
} from "../types";
import {Entities, EntitiesStore, RawEntitiesStore, ReferencedEntitiesStore} from "../../entities-store";
import {ChatsPreferencesStore, ChatStore} from "../../Chat";
import {MessageApi} from "../../api";
import {Message, TimeUnit} from "../../api/types/response";
import {Duration, getDate} from "../../utils/date-utils";
import {isDefined} from "../../utils/object-utils";

const DEFAULT_FETCH_OPTIONS: FetchMessagesOptions = {
    chatId: undefined,
    skipSettingLastMessage: true,
    abortIfInitiallyFetched: true
};

const MESSAGES_CLEANUP_THRESHOLD = 100;
const MESSAGES_CLEANUP_INTERVAL = Duration.of(30, TimeUnit.MINUTES);

export class MessagesOfChatStore {
    chatMessagesFetchingStateMap: ChatMessagesFetchingStateMap = {};

    runningChatCleanupState = observable.map<string, MessagesCleanupState>();

    cleanedUpMessagesData = observable.map<string, CleanedUpMessagesMetadata>();

    retryingRestoringMessagesIntervalsIds = observable.map<string, ReturnType<typeof setInterval>>();

    reservedReferences = observable.map<string, boolean>();

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    get previousChatId(): string | undefined {
        return this.chatStore.previousChatId;
    }

    get messagesOfChat(): string[] {
        if (this.selectedChatId) {
            const messages = this.isInSearchMode
                ? this.searchMessagesStore.foundMessagesIds
                : this.entities.chats.findById(this.selectedChatId).messages;
            return messages.slice().sort(createSortMessages(
                this.entities.messages.findById
            ));
        } else {
            return [];
        }
    }

    get lastMessage(): MessageEntity | undefined {
        if (!this.selectedChatId) {
            return undefined;
        }

        const messages = this.isInSearchMode
            ? this.entities.chats.findById(this.selectedChatId).messages
            : this.messagesOfChat;

        if (messages.length !== 0) {
            return this.entities.messages.findById(messages[messages.length - 1]);
        }

        return undefined;
    }

    get isInSearchMode(): boolean {
        return this.searchMessagesStore.query.trim().length !== 0;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly rawEntities: RawEntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly searchMessagesStore: SearchMessagesStore,
                private readonly entityReferences: ReferencedEntitiesStore,
                private readonly chatsPreferences: ChatsPreferencesStore,
                private readonly messageRepository: MessageRepository) {
        makeAutoObservable(this);

        reaction(
            () => this.selectedChatId,
            () => {
                this.fetchMessages({abortIfInitiallyFetched: true});
            }
        );

        reaction(
            () => this.selectedChatId,
            chatId => {
                if (chatId && this.chatsPreferences.enableVirtualScroll) {
                    this.reserveEntityReferences(chatId);
                }

                if (this.previousChatId) {
                    const chatId = this.previousChatId;
                    this.releaseEntityReferences(chatId);
                    setTimeout(() => this.cleanupMessages(chatId));
                }
            }
        );

        reaction(
            () => this.lastMessage?.id,
            lastMessageId => {
                if (lastMessageId && this.chatsPreferences.enableVirtualScroll) {
                    this.reserveEntityReferencesForMessage(lastMessageId);
                }
            }
        );
    }

    getFetchingState = computedFn((chatId: string) => {
        if (this.chatMessagesFetchingStateMap[chatId]) {
            return this.chatMessagesFetchingStateMap[chatId];
        } else {
            return {
                pending: false,
                initiallyFetched: false
            }
        }
    })

    getChatCleanupState = computedFn((chatId: string): MessagesCleanupState => {
        return this.runningChatCleanupState.get(chatId) ?? "absent";
    })

    isRunningCleanup = computedFn((chatId: string): boolean => {
        return this.getChatCleanupState(chatId) === "running";
    })

    fetchMessages = (options: FetchMessagesOptions = DEFAULT_FETCH_OPTIONS): void => {
       const chatId = options.chatId ?? this.selectedChatId;

       if (!chatId) {
           return;
       }

       const fetchingState = this.getFetchingState(chatId);

       if (fetchingState.pending) {
           return;
       }

       const chat = this.entities.chats.findById(chatId);
       const cleanupState = this.getChatCleanupState(chatId);
       const initiallyFetched = (fetchingState.initiallyFetched && cleanupState === "absent")
           || chat.messages.length > 50;

       if (initiallyFetched && options.abortIfInitiallyFetched) {
           return;
       }

       if (options.beforeId || cleanupState === "absent") {
           this.fetchMessagesFromApi(chatId, options.beforeId);
       } else if (cleanupState === "cleaned") {
           this.fetchMessagesFromDatabase(chatId);
       } else {
           this.retryFetchMessagesFromDatabase(chatId);
       }
    }

    private fetchMessagesFromApi = (chatId: string, beforeMessage?: string, skipSettingLastMessage?: boolean): void => {
        if (this.chatMessagesFetchingStateMap[chatId]) {
            this.chatMessagesFetchingStateMap[chatId].pending = true;
        } else {
            this.chatMessagesFetchingStateMap[chatId] = {
                pending: true,
                initiallyFetched: false
            };
        }

        let fetchMessageFunction: (...ars: any[]) => AxiosPromise<Message[]>;

        if (beforeMessage) {
            fetchMessageFunction = MessageApi.getMessagesByChatBeforeMessage;
        } else {
            fetchMessageFunction = MessageApi.getMessagesByChat;
        }

        fetchMessageFunction(chatId, beforeMessage)
            .then(({data}) => runInAction(() => {
                if (data.length !== 0) {
                    this.entities.messages.insertAll(data, {
                        skipSettingLastMessage: skipSettingLastMessage ?? true,
                        skipUpdatingChat: false
                    });
                }

                this.chatMessagesFetchingStateMap[chatId].initiallyFetched = true;
            }))
            .finally(() => runInAction(() => this.chatMessagesFetchingStateMap[chatId].pending = false));
    }

    private retryFetchMessagesFromDatabase = (chatId: string): void => {
        if (this.chatMessagesFetchingStateMap[chatId]) {
            this.chatMessagesFetchingStateMap[chatId].pending = true;
        } else {
            this.chatMessagesFetchingStateMap[chatId] = {
                pending: true,
                initiallyFetched: true
            };
        }

        const intervalId = setInterval(
            () => {
                if (this.getChatCleanupState(chatId) === "cleaned") {
                    this.fetchMessagesFromDatabase(chatId)
                }
            },
            50
        );
        this.retryingRestoringMessagesIntervalsIds.set(chatId, intervalId);
    }

    private fetchMessagesFromDatabase = async (chatId: string): Promise<void> => {
        if (this.getChatCleanupState(chatId) !== "cleaned") {
            return;
        }

        console.log("Restoring messages from database");
        this.chatMessagesFetchingStateMap[chatId].pending = true;
        let messages: MessageEntity[];

        const cleanupMetadata = this.cleanedUpMessagesData.get(chatId);

        if (cleanupMetadata) {
            messages = await this.messageRepository.findByChatIdAndCreatedAtBetween(
                chatId,
                cleanupMetadata.first.createdAt,
                cleanupMetadata.last.createdAt
            );
        } else {
            messages = await this.messageRepository.findByChatId(chatId);
        }

        const entitiesPatch = await this.messageRepository.restoreEntityPatchForEntities(messages);
        this.rawEntities.applyPatch(entitiesPatch, true, "low");

        runInAction(() => {
            const chat = this.entities.chats.findById(chatId);
            const messagesIds = entitiesPatch.ids.messages ?? [];
            chat.messages = [...messagesIds, ...chat.messages];
            this.entities.chats.insertEntity(chat);

            if (this.retryingRestoringMessagesIntervalsIds.has(chatId)) {
                this.retryingRestoringMessagesIntervalsIds.delete(chatId);
            }

            this.chatMessagesFetchingStateMap[chatId].pending = false;
            this.runningChatCleanupState.set(chatId, "absent");
            this.cleanedUpMessagesData.delete(chatId);
        });

        console.log("Completed restoring messages from database");
    }

    reserveEntityReferences = (chatId: string): void => {
        const chat = this.entities.chats.findById(chatId);
        const messagesIds = chat.messages;

        messagesIds.forEach(messageId => this.reserveEntityReferencesForMessage(messageId));
        this.reservedReferences.set(chatId, true);
    }

    reserveEntityReferencesForMessage = (messageId: string): void => {
        const [message, relationships] = this.entities.messages.findByIdWithRelationships(messageId);
        this.entityReferences.increaseReferenceCount("messages", message.id);

        Object.keys(relationships).forEach(key => {
            const entityName = key as Entities;
            const ids = relationships[entityName] ?? [];
            ids.forEach(id => this.entityReferences.increaseReferenceCount(entityName, id));
        });
    }

    releaseEntityReferences = (chatId: string): void => {
        if (!(this.reservedReferences.get(chatId) ?? false)) {
            return;
        }

        const chat = this.entities.chats.findById(chatId);
        const messagesIds = chat.messages;

        messagesIds.forEach(messageId => this.releaseEntityReferencesForMessage(messageId));
        this.reservedReferences.set(chatId, false);
    }

    releaseEntityReferencesForMessage = (messageId: string): void => {
        const [message, relationships] = this.entities.messages.findByIdWithRelationships(messageId);
        this.entityReferences.decreaseReferenceCount("messages", message.id);

        Object.keys(relationships).forEach(key => {
            const entityName = key as Entities;
            const ids = relationships[entityName] ?? [];

            ids.forEach(id => this.entityReferences.decreaseReferenceCount(entityName, id));
        });
    }

    cleanupMessages = (chatId: string): void => {
        if (this.isRunningCleanup(chatId)) {
            return;
        }

        const chat = this.entities.chats.findById(chatId);

        if (chat.messages.length < MESSAGES_CLEANUP_THRESHOLD) {
            return;
        }

        console.log("Running messages cleanup");
        this.runningChatCleanupState.set(chatId, "running");

        const messagesWithRelationships = this.entities.messages.findAllByIdWithRelationships(chat.messages);
        const cleanUpMessages: string[] = [];
        let first: CleanedUpMessageMetadata | undefined = undefined;
        let last: CleanedUpMessageMetadata | undefined = undefined;

        for (const [message, relationships] of messagesWithRelationships) {
            if (this.entityReferences.isEntityReferenced("messages", message.id)) {
                console.log(`Message ${message.id} is visible`);
                continue;
            }

            this.entities.messages.deleteById(message.id);

            Object.keys(relationships).forEach(key => {
                const entityName = key as Entities;
                const ids = relationships[entityName] ?? [];

                ids.forEach(id => {
                    if (!this.entityReferences.isEntityReferenced(entityName, id)) {
                        this.entityReferences.decreaseReferenceCount(entityName, id);
                    }
                });
            });

            cleanUpMessages.push(message.id);

            const messageCreatedAt = getDate(message.createdAt);

            if (!isDefined(first) || isBefore(messageCreatedAt, first!.createdAt)) {
                first = {
                    id: message.id,
                    createdAt: messageCreatedAt
                };
            }

            if (!isDefined(last) || isAfter(messageCreatedAt, last!.createdAt)) {
                last = {
                    id: message.id,
                    createdAt: messageCreatedAt
                };
            }
        }

        if (isDefined(first) && isDefined(last)) {
            this.cleanedUpMessagesData.set(chatId, {first, last});
        }

        chat.messages = chat.messages.filter(messageId => !cleanUpMessages.includes(messageId));
        this.entities.chats.insertEntity(chat);

        this.runningChatCleanupState.set(chatId, "cleaned");
        console.log("Finished running messages cleanup");
    }
}
