import {ChatRole} from "./ChatRole";
import {User} from "../../common/types";

export interface ChatParticipation {
    id: string,
    chatId: string,
    user: User,
    role: ChatRole
}
