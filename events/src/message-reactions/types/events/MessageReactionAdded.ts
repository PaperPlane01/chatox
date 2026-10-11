import {User} from "../../../common/types/User";

export interface MessageReactionAdded {
    id: string,
    messageId: string,
    chatId: string,
    emoji: any,
    emojiId: string,
    user: User,
    createdAt: string
}
