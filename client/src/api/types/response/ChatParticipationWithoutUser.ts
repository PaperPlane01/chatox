import {ChatBlocking} from "./ChatBlocking";
import {ChatRole} from "./ChatRole";

export interface ChatParticipationWithoutUser {
    id: string,
    role: ChatRole,
    activeChatBlocking?: ChatBlocking
}
