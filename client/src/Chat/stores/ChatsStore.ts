import {action, observable} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatOfCurrentUserEntity} from "../types";
import {SoftDeletableEntityStore} from "../../entity-store";
import {ChatDeletionReason, ChatOfCurrentUser, ChatType} from "../../api/types/response";

export class ChatsStore extends SoftDeletableEntityStore<ChatOfCurrentUserEntity, ChatOfCurrentUser> {
    @observable
    privateChats: {[userId: string]: string} = {};

    findBySlug = createTransformer((slug: string) => {
        const chats = this.ids.map(id => this.findById(id));
        return chats.find(chat => chat.slug === slug);
    })

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

    @action
    setDeletionReasonAndComment = (chatId: string, deletionReason?: ChatDeletionReason, comment?: string): void => {
        const chat = this.findByIdOptional(chatId);

        if (!chat) {
            return;
        }

        chat.deletionReason = deletionReason;
        chat.deletionComment = comment;

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

    protected convertToNormalizedForm(denormalizedEntity: ChatOfCurrentUser): ChatOfCurrentUserEntity {
        const indexToMessageMap: {[index: number]: string} = {};

        if (denormalizedEntity.lastMessage) {
            indexToMessageMap[denormalizedEntity.lastMessage.index] = denormalizedEntity.lastMessage.id;
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
            unreadMessagesCount: denormalizedEntity.unreadMessagesCount,
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
