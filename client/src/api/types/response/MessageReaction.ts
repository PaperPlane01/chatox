import {User} from "./User";

export interface MessageReaction {
    id: string;
    emojiId: string;
    user: User,
    createdAt: string,
    messageId: string
}
