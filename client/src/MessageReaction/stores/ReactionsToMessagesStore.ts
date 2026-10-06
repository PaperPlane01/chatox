import {makeAutoObservable, observable, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {EmojiData} from "emoji-mart";
import {orderBy, last} from "lodash-es";
import {MessageReactionEntity} from "../types";
import {createMessageEmojiKey} from "../utils";
import {MessageReactionRepository} from "../repositories";
import {FetchOptions, PaginationState} from "../../utils/types";
import type {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization/stores";
import {CurrentUser, MessageReaction, TimeUnit} from "../../api/types/response";
import {MessageReactionApi} from "../../api";
import {PaginationRequest} from "../../api/types/request";
import {getEmojiDataFromColons} from "../../Emoji/utils";
import {MessageReactionAdded, MessageReactionDeleted} from "../../api/types/websocket";
import {isDefined} from "../../utils/object-utils";
import {Duration} from "../../utils/date-utils";
import {MessageEntity} from "../../Message/types";
import {ExpirableStore} from "../../expirable-store";
import {Repositories} from "../../repositories";

const INITIAL_PAGINATION_STATE: PaginationState = {
    page: 0,
    pending: false,
    initiallyFetched: false,
    noMoreItems: false
};
const PAGE_SIZE = 200;

export class ReactionsToMessagesStore {
    allReactionsFetchingState = observable.map<string, PaginationState>();

    reactionsByEmojiIdFetchingState = observable.map<string, PaginationState>();

    reactionsToAdd = observable.map<string, MessageReactionAdded>();

    reactionsToAddQueue = observable.set<string>();

    reactionsToRemove = observable.map<string, MessageReactionDeleted>();

    reactionsToRemoveQueue = observable.set<string>();

    lockedMessages = observable.set<string>();

    recentRemovedReactions = new ExpirableStore<string, MessageReactionDeleted>(
        Duration.of(1, TimeUnit.HOURS)
    );

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly repositories: Repositories) {
        makeAutoObservable(this, {}, {autoBind: true});

        reaction(
            () => this.reactionsToAddQueue,
            () => setTimeout(() => {
                const reactionId = this.reactionsToAddQueue.values().next().value;

                if (reactionId) {
                    const reaction = this.reactionsToAdd.get(reactionId);

                    if (reaction) {
                        this.onMessageReactionAdded(reaction);
                    }
                }
            }, 50)
        );
    }

    isMessageLocked = computedFn((messageId: string): boolean => {
        return this.lockedMessages.has(messageId);
    })

    async addReaction(messageReaction: MessageReaction): Promise<void> {
        if (this.reactionExists(messageReaction.id)) {
            this.removeReactionFromAddQueue(messageReaction.id);
            return;
        }

        const emojiId = messageReaction.emojiId;

        if (this.isMessageLocked(messageReaction.messageId)) {
            const emoji = await getEmojiDataFromColons(`:${emojiId}:`);
            const message = this.entities.messages.findById(messageReaction.messageId);
            this.reactionsToAdd.set(messageReaction.id, {
                ...messageReaction,
                emoji: emoji!,
                chatId: message.chatId
            });
            this.reactionsToAddQueue.add(messageReaction.id);
            return;
        }

        const message = this.entities.messages.findByIdOptional(messageReaction.messageId);

        if (!message) {
            return;
        }

        this.lockedMessages.add(messageReaction.messageId);

        const reaction = this.entities.messageReactions.insert(messageReaction);
        const emoji = message.reactionsCount[emojiId]?.emoji
            ?? await getEmojiDataFromColons(`:${emojiId}:`);
        this.addLastReactionToMessage(message, reaction, emoji);

        this.lockedMessages.delete(messageReaction.messageId);

        this.removeReactionFromAddQueue(messageReaction.id);
    }

    onMessageReactionAdded(messageReactionAdded: MessageReactionAdded): void {
        if (this.reactionExists(messageReactionAdded.id)) {
            this.removeReactionFromAddQueue(messageReactionAdded.id);
            return;
        }

        if (this.isMessageLocked(messageReactionAdded.messageId)) {
            this.reactionsToAdd.set(messageReactionAdded.id, messageReactionAdded);
            this.reactionsToAddQueue.add(messageReactionAdded.id);
            return;
        }

        this.lockedMessages.add(messageReactionAdded.messageId);

        const reaction = this.entities.messageReactions.insert(messageReactionAdded);
        const message = this.entities.messages.findByIdOptional(messageReactionAdded.messageId);

        if (message) {
            const emoji = messageReactionAdded.emoji;
            this.addLastReactionToMessage(message, reaction, emoji);
        }

        this.lockedMessages.delete(messageReactionAdded.messageId);
        this.removeReactionFromAddQueue(messageReactionAdded.id);
    }

    private addLastReactionToMessage(
        message: MessageEntity,
        messageReaction: MessageReactionEntity,
        emoji: EmojiData
    ): void {
        runInAction(() => {
            const emojiId = emoji.id;

            if (message.reactionsCount[emojiId]) {
                message.reactionsCount[emojiId].count = message.reactionsCount[emojiId].count + 1;
                const lastReactions = this.entities.messageReactions.findAllById(message.reactionsCount[emojiId].lastReactions);
                lastReactions.push(messageReaction);
                message.reactionsCount[emojiId].lastReactions = orderBy(lastReactions, reaction => reaction.createdAt, "desc")
                    .slice(0, 2)
                    .map(reaction => reaction.id);

                if (messageReaction.userId === this.currentUser?.id) {
                    message.reactionsCount[emojiId].reactedByCurrentUser = true;
                    message.reactionsCount[emojiId].currentUserReactionId = messageReaction.id;
                }
            } else {
                message.reactionsCount[emojiId] = {
                    emoji: emoji,
                    lastReactions: [messageReaction.id],
                    count: 1,
                    reactedByCurrentUser: messageReaction.userId === this.currentUser?.id,
                    currentUserReactionId: messageReaction.id
                };
            }

            this.entities.messages.insertEntity(message);
        });
    }

    private reactionExists(reactionId: string): boolean {
        return isDefined(this.entities.messageReactions.findByIdOptional(reactionId));
    }

    private removeReactionFromAddQueue(reactionId: string): void {
        runInAction(() => {
            this.reactionsToAddQueue.delete(reactionId);
            this.reactionsToAdd.delete(reactionId);
        });
    }

    onMessageReactionDeleted(messageReaction: MessageReactionDeleted): void {
        if (this.isReactionDeletedRecently(messageReaction.id)) {
            this.removeReactionFromRemoveQueue(messageReaction.id);
            return;
        }

        if (this.isMessageLocked(messageReaction.messageId)) {
            this.reactionsToRemove.set(messageReaction.id, messageReaction);
            this.reactionsToRemoveQueue.add(messageReaction.id);
            return;
        }

        const message = this.entities.messages.findByIdOptional(messageReaction.messageId);

        if (!message) {
            return;
        }

        this.decreaseCountAndRemoveFromLastReactions(message, messageReaction);

        this.lockedMessages.delete(message.id);

        this.entities.messageReactions.deleteById(messageReaction.id);
        this.recentRemovedReactions.set(messageReaction.id, messageReaction);
        this.removeReactionFromRemoveQueue(messageReaction.id);
    }

    private decreaseCountAndRemoveFromLastReactions(message: MessageEntity, messageReaction: MessageReactionDeleted): void {
        runInAction(() => {
            if (!message.reactionsCount[messageReaction.emojiId]) {
                return;
            }

            message.reactionsCount[messageReaction.emojiId].count
                = message.reactionsCount[messageReaction.emojiId].count - 1;
            message.reactionsCount[messageReaction.emojiId].lastReactions
                = message.reactionsCount[messageReaction.emojiId]
                .lastReactions
                .filter(reactionId => reactionId !== messageReaction.id)

            if (messageReaction.userId === this.currentUser?.id) {
                message.reactionsCount[messageReaction.emojiId].reactedByCurrentUser = false;
                message.reactionsCount[messageReaction.emojiId].currentUserReactionId = undefined;
            }

            if (message.reactionsCount[messageReaction.emojiId].count === 0) {
                delete message.reactionsCount[messageReaction.emojiId];
            }

            this.entities.messages.insertEntity(message);
        });
    }

    private isReactionDeletedRecently(reactionId: string): boolean {
        return isDefined(this.recentRemovedReactions.get(reactionId));
    }

    private removeReactionFromRemoveQueue(reactionId: string): void {
        runInAction(() => {
            this.reactionsToRemoveQueue.delete(reactionId);
            this.reactionsToRemove.delete(reactionId);
        });
    }

    fetchReactions(messageId: string, emojiId?: string, options?: FetchOptions): void {
        if (this.isPending(messageId, emojiId)) {
            return;
        }

        const paginationState = this.getPaginationState(messageId, emojiId);

        if (paginationState.noMoreItems) {
            return;
        }

        if ((options?.abortIfInitiallyFetched ?? false) && paginationState.initiallyFetched) {
            return;
        }

        const chatId = this.entities.messages.findByIdOptional(messageId)?.chatId;

        if (!chatId) {
            return;
        }

        const paginationRequest: PaginationRequest = {
            page: paginationState.page,
            pageSize: PAGE_SIZE
        };
        const responsePromise = emojiId
            ? MessageReactionApi.getMessageReactionsByEmojiId(
                chatId,
                messageId,
                emojiId,
                paginationRequest
            )
            : MessageReactionApi.getMessageReactions(chatId, messageId, paginationRequest);

        this.initReactionsFetchingState(messageId, emojiId);

        responsePromise
            .then(({data}) => runInAction(() => {
                this.entities.messageReactions.insertAll(data);
                this.setPaginationState(messageId, emojiId, {
                    ...paginationState,
                    initiallyFetched: true,
                    pending: false,
                    noMoreItems: data.length !== PAGE_SIZE,
                    page: data.length === PAGE_SIZE
                        ? paginationState.page + 1
                        : paginationState.page,
                });
                this.cleanupReactions(
                    messageId,
                    emojiId,
                    this.entities.messageReactions.findAllById(data.map(reaction => reaction.id)),
                    this.repositories.getRepository("messageReactions")
                );
            }))
            .catch(() => this.setPaginationState(messageId, emojiId, {
                ...paginationState,
                pending: false
            }));
    }

    private async cleanupReactions(
        messageId: string,
        emojiId: string | undefined,
        reactionsFromApi: MessageReactionEntity[],
        repository: MessageReactionRepository | undefined
    ): Promise<void> {
        if (!repository) {
            return;
        }

        if (emojiId) {
            await this.cleanupReactionsByMessageAndEmoji(
                messageId,
                emojiId,
                reactionsFromApi,
                repository
            );
        } else {
            await this.cleanupReactionsByMessage(messageId, reactionsFromApi, repository)
        }
    }

    private async cleanupReactionsByMessageAndEmoji(
        messageId: string,
        emojiId: string,
        reactionsFromApi: MessageReactionEntity[],
        repository: MessageReactionRepository
    ): Promise<void> {
        let reactionsToDelete: MessageReactionEntity[] = [];
        const paginationState = this.getPaginationState(messageId, emojiId);

        if (paginationState.noMoreItems) {
            const lastReaction = last(this.entities.messageReactions.findByMessageIdAndEmojiId(messageId, emojiId));

            if (lastReaction) {
                reactionsToDelete = await repository.findByMessageIdAndEmojiIdAndCreatedAtAfter(
                    messageId,
                    emojiId,
                    lastReaction.createdAt
                );
            } else {
                reactionsToDelete = await repository.findByMessageIdAndEmojiId(messageId, emojiId);
            }
        } else {
            const orderedReactions = orderBy(
                reactionsFromApi,
                reaction => reaction.createdAt,
                "asc"
            );
            const reactionsIds = new Set(orderedReactions.map(reaction => reaction.id));
            const firstDate = orderedReactions[0].createdAt;
            const lastDate = orderedReactions.at(-1)?.createdAt;

            if (!lastDate) {
                return;
            }

            reactionsToDelete = (await repository.findByMessageIdAndEmojiIdAndCreatedAtBetween(
                messageId,
                emojiId,
                firstDate,
                lastDate
            ))
                .filter(reaction => !reactionsIds.has(reaction.id));
        }

        await this.deleteReactions(reactionsToDelete, repository);
    }

    private async cleanupReactionsByMessage(messageId: string, reactions: MessageReactionEntity[], repository: MessageReactionRepository): Promise<void> {
        let reactionsToDelete: MessageReactionEntity[] = [];
        const paginationSate = this.getPaginationState(messageId, undefined);

        if (paginationSate.noMoreItems) {
            const lastReaction = last(this.entities.messageReactions.findByMessageId(messageId));

            if (lastReaction) {
                reactionsToDelete = await repository.findByMessageIdAndCreatedAtAfter(messageId, lastReaction.createdAt);
            } else {
                reactionsToDelete = await repository.findByMessageId(messageId);
            }
        } else {
            const orderedReactions = orderBy(
                reactions,
                reaction => reaction.createdAt,
                "asc"
            );
            const reactionsIds = new Set(orderedReactions.map(reaction => reaction.id));
            const firstDate = orderedReactions[0].createdAt;
            const lastDate = orderedReactions.at(-1)?.createdAt;

            if (!lastDate) {
                return;
            }

            reactionsToDelete = (await repository.findByMessageIdAndCreatedAtBetween(
                messageId,
                firstDate,
                lastDate
            ))
                .filter(reaction => !reactionsIds.has(reaction.id));
        }

        await this.deleteReactions(reactionsToDelete, repository);
    }

    private async deleteReactions(reactions: MessageReactionEntity[], repository: MessageReactionRepository): Promise<void> {
        if (reactions.length !== 0) {
            await repository.deleteAllByIds(reactions.map(reaction => reaction.id));
        }
    }

    getPaginationState = computedFn((messageId: string, emojiId: string | null | undefined): PaginationState => {
        if (emojiId) {
            return this.reactionsByEmojiIdFetchingState.get(createMessageEmojiKey(messageId, emojiId))
                ?? {...INITIAL_PAGINATION_STATE};
        } else {
            return this.allReactionsFetchingState.get(messageId) ?? {...INITIAL_PAGINATION_STATE};
        }
    })

    isPending = computedFn((messageId: string, emojiId: string | undefined): boolean => {
        if (emojiId) {
            return this.reactionsByEmojiIdFetchingState.get(createMessageEmojiKey(messageId, emojiId))?.pending ?? false;
        } else {
            return this.allReactionsFetchingState.get(messageId)?.pending ?? false;
        }
    })

    private setPaginationState(messageId: string, emojiId: string | undefined, paginationState: PaginationState): void {
        runInAction(() => {
            this.initReactionsFetchingState(messageId, emojiId);

            if (emojiId) {
                this.reactionsByEmojiIdFetchingState.set(createMessageEmojiKey(messageId, emojiId), paginationState);
            } else {
                this.allReactionsFetchingState.set(messageId, paginationState);
            }
        })
    }

    private initReactionsFetchingState(messageId: string, emojiId?: string): void {
        if (emojiId) {
            const key = createMessageEmojiKey(messageId, emojiId);
            if (!this.reactionsByEmojiIdFetchingState.has(key)) {
                this.reactionsByEmojiIdFetchingState.set(key, {...INITIAL_PAGINATION_STATE});
            }
        } else if (!this.allReactionsFetchingState.has(messageId)) {
            this.allReactionsFetchingState.set(messageId, {...INITIAL_PAGINATION_STATE});
        }
    }
}
