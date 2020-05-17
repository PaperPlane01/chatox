import {ChatRole} from "./ChatRole";
import {User} from "./User";
import {ChatBlocking} from "./ChatBlocking";

export interface ChatParticipation {
    id: string,
    role: ChatRole,
    user: User,
    chatId: string,
    activeChatBlocking?: ChatBlocking
}
