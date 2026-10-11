import {EmojiData} from "emoji-mart";
import {User} from "../response";

export interface MessageReactionAdded {
    id: string,
    messageId: string,
    chatId: string,
    emoji: EmojiData,
    emojiId: string,
    user: User,
    createdAt: string
}
