import {ChatRole} from "./ChatRole";
import {ChatBlocking} from "./ChatBlocking";

export interface ChatParticipationWithoutUser {
    id: string,
    role: ChatRole,
    activeChatBlocking?: ChatBlocking
}
