import {ChatRole} from "./ChatRole";
import {User} from "./User";

export interface ChatParticipation {
    id: string,
    role: ChatRole,
    user: User
}
