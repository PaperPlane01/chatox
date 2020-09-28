import {action} from "mobx";
import {createTransformer} from "mobx-utils";
import {ChatOfCurrentUserEntity} from "../types";
import {AbstractEntityStore} from "../../entity-store";
import {ChatOfCurrentUser} from "../../api/types/response";

export class ChatsStore extends AbstractEntityStore<ChatOfCurrentUserEntity, ChatOfCurrentUser> {
    constructor() {
        super();
    }

    findBySlug = createTransformer((slug: string) => {
        const chats = this.ids.map(id => this.findById(id));
        return chats.find(chat => chat.slug === slug);
    });

    @action
    setLastMessageOfChat = (chatId: string, messageId: string): void => {
        const chat = this.findById(chatId);
        chat.lastMessage = messageId;
        this.insertEntity(chat);
    };

    @action
    setLastReadMessageOfChat = (chatId: string, messageId: string): void => {
        const chat = this.findById(chatId);
        chat.lastReadMessage = messageId;
        this.insertEntity(chat);
    };

    @action
    setUnreadMessagesCountOfChat = (chatId: string, unreadMessagesCount: number): void => {
        const chat = this.findById(chatId);
        chat.unreadMessagesCount = unreadMessagesCount;
        this.insertEntity(chat);
    };

    @action
    addMessageToChat = (chatId: string, messageId: string): void => {
        const chat = this.findById(chatId);
        chat.messages = Array.from(new Set([...chat.messages, messageId]));
        chat.lastMessage = messageId;
        this.insertEntity(chat);
    };

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
            onlineParticipantsCount: denormalizedEntity.onlineParticipantsCount
        }
    }
}
