import {action} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatOfCurrentUserEntity} from "../types";
import {SoftDeletableEntityStore} from "../../entity-store";
import {ChatDeletionReason, ChatOfCurrentUser} from "../../api/types/response";

export class ChatsStore extends SoftDeletableEntityStore<ChatOfCurrentUserEntity, ChatOfCurrentUser> {
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
        const chat = this.findById(chatId);
        chat.unreadMessagesCount = chat.unreadMessagesCount + 1;
        this.insertEntity(chat);
    }

    @action
    decreaseUnreadMessagesCountOfChat = (chatId: string): void => {
        const chat = this.findById(chatId);

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
    addMessageToChat = (chatId: string, messageId: string): void => {
        const chat = this.findById(chatId);
        chat.messages = Array.from(new Set([...chat.messages, messageId]));
        chat.lastMessage = messageId;
        this.insertEntity(chat);
    }

    @action
    addScheduledMessageToChat = (chatId: string, messageId: string): void => {
        const chat = this.findById(chatId);
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

    protected convertToNormalizedForm(denormalizedEntity: ChatOfCurrentUser): ChatOfCurrentUserEntity {
        return {
            id: denormalizedEntity.id,
            avatarUri: denormalizedEntity.avatarUri,
            lastMessage: denormalizedEntity.lastMessage && denormalizedEntity.lastMessage.id,
            lastReadMessage: denormalizedEntity.lastReadMessage && denormalizedEntity.lastReadMessage.id,
            name: denormalizedEntity.name,
            slug: denormalizedEntity.slug,
            createdAt: new Date(denormalizedEntity.createdAt),
            messages: denormalizedEntity.lastMessage ? [denormalizedEntity.lastMessage.id] : [],
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
            scheduledMessages: []
        }
    }
}
