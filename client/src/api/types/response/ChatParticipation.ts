import {User} from "./User";
import {ChatBlocking} from "./ChatBlocking";
import {ChatRole} from "./ChatRole";

export interface ChatParticipation {
    id: string,
    role: ChatRole,
    user: User,
    chatId: string,
    activeChatBlocking?: ChatBlocking
}
