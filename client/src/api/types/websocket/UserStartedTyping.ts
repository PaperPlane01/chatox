import {User} from "../response";

export interface UserStartedTyping {
    user: User,
    chatId: string
}
