import {makeAutoObservable, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {ChatListEntry, ChatOfCurrentUserEntity} from "../types";
import {EntitiesStore, RawEntitiesStore} from "../../entities-store";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {ChatType} from "../../api/types/response";
import {UserEntity} from "../../User";
import {getUserDisplayedName} from "../../User/utils/labels";
import {DraftMessageRepository} from "../../Message/repositories";
import {isDefined} from "../../utils/object-utils";

export class ChatsOfCurrentUserStore {
    pending = false;

    error?: ApiError;

    localDraftMessagesLoaded = false;

    constructor(private readonly entities: EntitiesStore,
                private readonly rawEntities: RawEntitiesStore,
                private readonly draftMessageRepository: DraftMessageRepository) {
        makeAutoObservable(this);

        reaction(
            () => this.chatsOfCurrentUser,
            () => this.loadLocalDraftMessages()
        );
    }

    get chatsOfCurrentUser(): ChatListEntry[] {
        return this.entities.chats.ids
            .map(chatId => this.entities.chats.findById(chatId))
            .filter(chat => Boolean(chat.currentUserParticipationId))
            .sort((left, right) => {
                const leftLastMessageId = left.lastMessage;
                const rightLastMessageId = right.lastMessage;

                const leftDate = leftLastMessageId
                    ? this.entities.messages.findById(leftLastMessageId).createdAt
                    : left.createdAt;
                const rightDate = rightLastMessageId
                    ? this.entities.messages.findById(rightLastMessageId).createdAt
                    : right.createdAt;

                return rightDate.getTime() - leftDate.getTime();
            })
            .map(chat => ({
                chatId: chat.id,
                messageId: chat.lastMessage,
                unreadMentionsCount: chat.unreadMentionsCount,
                unreadMessagesCount: chat.unreadMessagesCount,
                chatType: chat.type,
                draftMessageId: chat.draftMessageId
            }));
    }

    get totalUnreadMessagesCount(): number {
        return this.chatsOfCurrentUser
            .map(chat => chat.unreadMessagesCount ?? 0)
            .reduce((left, right) => left + right, 0)
    }

    get unreadChatsCount(): number {
        return this.chatsOfCurrentUser
            .filter(chat => chat.unreadMessagesCount ?? 0 !== 0)
            .length
    }

    get hasUnreadMentions(): boolean {
        return this.chatsOfCurrentUser
            .filter(chat => chat.unreadMentionsCount ?? 0 !== 0)
            .length !== 0;
    }

    get hasUnreadDialogs(): boolean {
        return this.chatsOfCurrentUser
            .filter(chat => chat.chatType === ChatType.DIALOG && (chat.unreadMessagesCount ?? 0 !== 0))
            .length !== 0;
    }

    get chatsOfCurrentUserInAlphabeticalOrder(): ChatListEntry[] {
        return this.entities.chats.ids
            .map(chatId => this.entities.chats.findById(chatId))
            .filter(chat => Boolean(chat.currentUserParticipationId))
            .sort((left, right) => {
                const leftName = this.getChatName(left);
                const rightName = this.getChatName(right);

                return leftName.localeCompare(rightName);
            })
            .map(chat => ({
                chatId: chat.id,
                chatType: chat.type
            }));
    }

    getChatsInAlphabeticalOrder = computedFn((chatType?: ChatType): ChatListEntry[] => {
        if (!chatType) {
            return this.chatsOfCurrentUserInAlphabeticalOrder;
        }

        return this.chatsOfCurrentUserInAlphabeticalOrder.filter(chat => chat.chatType === chatType);
    })

    getChatName = computedFn((chat?: ChatOfCurrentUserEntity, user?: UserEntity): string => {
        if (!chat) {
            if (user) {
                return getUserDisplayedName(user);
            } else {
                return "";
            }
        }

        if (chat.type === ChatType.DIALOG) {
            const chatUser = user ?? this.entities.users.findById(chat.userId!);
            return getUserDisplayedName(chatUser);
        } else {
            return chat.name;
        }
    })

    fetchChatsOfCurrentUser = (): void => {
        this.pending = true;
        this.error = undefined;

        ChatApi.getChatsOfCurrentUser()
            .then(({data}) => this.entities.chats.insertAll(data))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false))
    }

    private async loadLocalDraftMessages(): Promise<void> {
        if (this.localDraftMessagesLoaded || this.chatsOfCurrentUser.length === 0) {
            return;
        }

        const chatsWithoutRemoteDraftMessage = this.chatsOfCurrentUser
            .filter(chat => !isDefined(chat.draftMessageId))
            .map(chat => chat.chatId);

        if (chatsWithoutRemoteDraftMessage.length === 0) {
            return;
        }

        const draftMessages = await this.draftMessageRepository.findByChatIdIn(chatsWithoutRemoteDraftMessage);
        const entityPatch = await this.draftMessageRepository.restoreEntityPatchForEntities(draftMessages);
        this.rawEntities.applyPatch(entityPatch, true, "low");

        const messagesByChatId = new Map(draftMessages.map(draftMessage => [draftMessage.chatId, draftMessage]));
        const chats = this.entities.chats.findAllById(chatsWithoutRemoteDraftMessage);

       runInAction(() => {
           chats.forEach(chat => {
               const draftMessage = messagesByChatId.get(chat.id);

               if (draftMessage) {
                   chat.draftMessageId = draftMessage.id;
               }
           });

           this.entities.chats.insertAllEntities(chats);
           this.localDraftMessagesLoaded = true;
       });
    }
}
