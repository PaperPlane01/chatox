import {action, computed, observable} from "mobx";
import {createTransformer} from "mobx-utils";
import {mergeWith} from "lodash";
import {ChatOfCurrentUserEntity} from "../types";
import {SoftDeletableEntityStore} from "../../entity-store";
import {
    ChatDeletionReason,
    ChatOfCurrentUser,
    ChatParticipation,
    ChatType,
    CurrentUser
} from "../../api/types/response";
import {EntitiesPatch, EntitiesStore, RawEntitiesStore} from "../../entities-store";
import {mergeCustomizer} from "../../utils/object-utils";
import {AuthorizationStore} from "../../Authorization";
import {PartialBy} from "../../utils/types";
import {ChatUpdated, PrivateChatCreated} from "../../api/types/websocket";

interface DeleteChatOptions {
    deletionReason?: ChatDeletionReason,
    deletionComment?: string
}

export class ChatsStore extends SoftDeletableEntityStore<
    "chats",
    ChatOfCurrentUserEntity,
    PartialBy<ChatOfCurrentUser, "unreadMessagesCount" | "deleted">,
    {},
    {deletionReason: ChatDeletionReason, deletionComment: string}
    > {
    @observable
    privateChats: {[userId: string]: string} = {};

    @computed
    private get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(rawEntities: RawEntitiesStore,
                entities: EntitiesStore,
                private readonly authorization: AuthorizationStore) {
        super(rawEntities, "chats", entities);
    }

    findBySlug = createTransformer((slug: string) => {
        const chats = this.ids.map(id => this.findById(id));
        return chats.find(chat => chat.slug === slug);
    });

    @action
    onChatUpdated = (chatUpdated: ChatUpdated): void => {
        const chat = this.findByIdOptional(chatUpdated.id);

        if (!chat) {
            return;
        }

        chat.name = chatUpdated.name;
        chat.slug = chatUpdated.slug;
        chat.avatarId = chatUpdated.avatar ? chatUpdated.avatar.id : undefined;
        chat.description = chatUpdated.description;

        this.insertEntity(chat);
    }

    @action
    onPrivateChatCreated = (privateChatCreated: PrivateChatCreated): void => {
        if (!this.currentUser) {
            return;
        }

        let currentUserChatParticipation: ChatParticipation | undefined;
        let otherUserChatParticipation: ChatParticipation | undefined;

        for (const chatParticipation of privateChatCreated.chatParticipations) {
            if (chatParticipation.user.id === this.currentUser.id) {
                currentUserChatParticipation = chatParticipation;
            } else {
                otherUserChatParticipation = chatParticipation;
            }
        }

        if (!otherUserChatParticipation || !currentUserChatParticipation) {
            return;
        }

        const patch = this.createEmptyEntitiesPatch("chats", "chatParticipations");
        const patches: EntitiesPatch[] = [];

        patch.entities.chats[privateChatCreated.id] = {
            id: privateChatCreated.id,
            name: "",
            lastMessage: privateChatCreated.message.id,
            type: ChatType.DIALOG,
            userId: otherUserChatParticipation.user.id,
            deleted: false,
            messages: [],
            unreadMessagesCount: privateChatCreated.message.sender.id === this.currentUser.id ? 0 : 1,
            participantsCount: 0,
            participants: [],
            indexToMessageMap: {},
            createdAt: new Date(),
            createdByCurrentUser: privateChatCreated.message.sender.id === this.currentUser.id,
            onlineParticipantsCount: 0,
            scheduledMessages: [],
            tags: []
        };
        patch.ids.chats.push(privateChatCreated.id);

        patches.push(this.entities.chatParticipations.createPatchForArray([currentUserChatParticipation, otherUserChatParticipation]));

        this.rawEntities.applyPatch(mergeWith(
            patch,
            ...patches,
            mergeCustomizer
        ));
    }

    @action
    setLastMessageOfChat = (chatId: string, messageId: string): void => {
        const chat = this.findById(chatId);
        chat.lastMessage = messageId;
        this.insertEntity(chat);
    }

    @action
    setLastReadMessageOfChat = (chatId: string, messageId: string): void => {
        const chat = this.findById(chatId);
        chat.lastReadMessage = messageId;
        this.insertEntity(chat);
    }

    @action
    increaseUnreadMessagesCountOfChat = (chatId: string): void => {
        const chat = this.findByIdOptional(chatId);

        if (!chat) {
            return;
        }

        chat.unreadMessagesCount = chat.unreadMessagesCount + 1;
        this.insertEntity(chat);
    }

    @action
    decreaseUnreadMessagesCountOfChat = (chatId: string): void => {
        const chat = this.findByIdOptional(chatId);

        if (!chat) {
            return;
        }

        if (chat.unreadMessagesCount !== 0) {
            chat.unreadMessagesCount = chat.unreadMessagesCount - 1;
            this.insertEntity(chat);
        }
    }

    @action
    setUnreadMessagesCountOfChat = (chatId: string, unreadMessagesCount: number): void => {
        const chat = this.findById(chatId);
        chat.unreadMessagesCount = unreadMessagesCount;
        this.insertEntity(chat);
    }

    @action
    addMessageToChat = (chatId: string, messageId: string, messageIndex: number, skipSettingLastMessage: boolean = false): void => {
        const chat = this.findByIdOptional(chatId);

        if (!chat) {
            return;
        }

        chat.indexToMessageMap[messageIndex] = messageId;
        chat.messages = Array.from(new Set([...chat.messages, messageId]));

        if (!skipSettingLastMessage) {
            chat.lastMessage = messageId;
        }

        this.insertEntity(chat);
    }

    @action
    addScheduledMessageToChat = (chatId: string, messageId: string): void => {
        const chat = this.findByIdOptional(chatId);

        if (!chat) {
            return;
        }

        chat.scheduledMessages = Array.from(new Set([...chat.scheduledMessages, messageId]));
        this.insertEntity(chat);
    }

    @action
    addScheduledMessagesToChat = (chatId: string, messageIds: string[]): void => {
        messageIds.forEach(messageId => this.addScheduledMessageToChat(chatId, messageId));
    }

    @action
    removeScheduledMessageFromChat = (chatId: string, messageIdToDelete: string): void => {
        const chat = this.findById(chatId);
        chat.scheduledMessages = chat.scheduledMessages.filter(messageId => messageId !== messageIdToDelete);
        this.insertEntity(chat);
    }

    @action
    increaseChatParticipantsCount = (chatId: string): void => {
        const chat = this.findByIdOptional(chatId);

        if (chat) {
            chat.participantsCount++;
            this.insertEntity(chat);
        }
    }

    @action
    decreaseChatParticipantsCount = (chatId: string): void => {
        const chat = this.findByIdOptional(chatId);

        if (chat) {
            chat.participantsCount--;
            this.insertEntity(chat);
        }
    }

    @action.bound
    deleteById(id: string, options?: DeleteChatOptions): void {
        if (!options) {
            super.deleteById(id);
            return;
        }

        const chat = this.findByIdOptional(id);

        if (!chat) {
            return;
        }

        chat.deleted = true;
        chat.deletionReason = options.deletionReason;
        chat.deletionComment = options.deletionReason;

        this.insertEntity(chat);
    }

    @action.bound
    public insert(denormalizedEntity: ChatOfCurrentUser): ChatOfCurrentUserEntity {
        if (denormalizedEntity.type === ChatType.DIALOG && denormalizedEntity.user) {
            this.privateChats = {
                ...this.privateChats,
                [denormalizedEntity.user.id]: denormalizedEntity.id
            };
        }

        return super.insert(denormalizedEntity);
    }

    @action.bound
    public insertEntity(entity: ChatOfCurrentUserEntity): ChatOfCurrentUserEntity {
        if (entity.type === ChatType.DIALOG && entity.userId) {
            this.privateChats = {
                ...this.privateChats,
                [entity.userId]: entity.id
            };
        }

        return super.insertEntity(entity);
    }

    createPatchForArray(denormalizedEntities: ChatOfCurrentUser[], options?: {}): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("chats");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(denormalizedEntity => {
            const chat = this.convertToNormalizedForm(denormalizedEntity);

            if (denormalizedEntity.user) {
                patches.push(this.entities.users.createPatch(denormalizedEntity.user));
            }

            if (denormalizedEntity.chatParticipation && this.currentUser) {
                patches.push(this.entities.chatParticipations.createPatch({
                    ...denormalizedEntity.chatParticipation,
                    user: {
                        ...this.currentUser,
                        online: true,
                        deleted: false
                    },
                    chatId: denormalizedEntity.id
                }));
            }

            if (denormalizedEntity.lastReadMessage) {
                patches.push(
                    this.entities.messages.createPatch(denormalizedEntity.lastReadMessage, {skipSettingLastMessage: true})
                );
                chat.lastReadMessage = denormalizedEntity.lastReadMessage.id;
                chat.messages.push(denormalizedEntity.lastReadMessage.id);
            }

            if (denormalizedEntity.lastMessage) {
                patches.push(this.entities.messages.createPatch(denormalizedEntity.lastMessage, {skipSettingLastMessage: true}));
                chat.lastMessage = denormalizedEntity.lastMessage.id;
                chat.messages.push(denormalizedEntity.lastMessage.id);
            }

            if (denormalizedEntity.avatar) {
                patches.push(this.entities.uploads.createPatch(denormalizedEntity.avatar));
            }

            patch.entities.chats[denormalizedEntity.id] = chat;
            patch.ids.chats.push(chat.id);
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    protected convertToNormalizedForm(denormalizedEntity: PartialBy<ChatOfCurrentUser, "unreadMessagesCount">): ChatOfCurrentUserEntity {
        const indexToMessageMap: {[index: number]: string} = {};

        if (denormalizedEntity.lastMessage) {
            indexToMessageMap[denormalizedEntity.lastMessage.index] = denormalizedEntity.lastMessage.id;
        }

        let unreadMessagesCount = 0;

        if (denormalizedEntity.unreadMessagesCount !== undefined) {
            unreadMessagesCount = denormalizedEntity.unreadMessagesCount;
        } else {
            const existingChat = this.findByIdOptional(denormalizedEntity.id);

            if (existingChat) {
                unreadMessagesCount = existingChat.unreadMessagesCount;
            }
        }

        return {
            id: denormalizedEntity.id,
            avatarUri: denormalizedEntity.avatarUri,
            lastMessage: denormalizedEntity.lastMessage && denormalizedEntity.lastMessage.id,
            lastReadMessage: denormalizedEntity.lastReadMessage && denormalizedEntity.lastReadMessage.id,
            name: denormalizedEntity.name,
            slug: denormalizedEntity.slug,
            createdAt: new Date(denormalizedEntity.createdAt),
            messages: denormalizedEntity.lastMessage ? [denormalizedEntity.lastMessage.id] : [],
            indexToMessageMap,
            unreadMessagesCount,
            participantsCount: denormalizedEntity.participantsCount,
            participants: [],
            currentUserParticipationId: denormalizedEntity.chatParticipation
                && denormalizedEntity.chatParticipation.id,
            description: denormalizedEntity.description,
            avatarId: denormalizedEntity.avatar && denormalizedEntity.avatar.id,
            createdByCurrentUser: denormalizedEntity.createdByCurrentUser,
            tags: denormalizedEntity.tags,
            onlineParticipantsCount: denormalizedEntity.onlineParticipantsCount,
            deleted: denormalizedEntity.deleted,
            deletionComment: denormalizedEntity.deletionComment,
            deletionReason: denormalizedEntity.deletionReason,
            scheduledMessages: [],
            userId: denormalizedEntity.user ? denormalizedEntity.user.id : undefined,
            type: denormalizedEntity.type
        }
    }
}