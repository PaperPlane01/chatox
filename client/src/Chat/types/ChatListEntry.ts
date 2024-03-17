import {ChatType} from "../../api/types/response";

export interface ChatListEntry {
    chatId: string,
    messageId?: string,
    unreadMessagesCount?: number,
    unreadMentionsCount?: number,
    chatType: ChatType
}