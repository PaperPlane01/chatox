import {ChatRole} from "./ChatRole";
import {User} from "../../common/types";

export interface ChatParticipationDto {
    id: string,
    chatId: string,
    user: User,
    role: ChatRole
}
