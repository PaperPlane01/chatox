import {ChatRole} from "./ChatRole";
import {User} from "../../common/types";

export interface CreateChatParticipationDto {
    id: string,
    chatId: string,
    user: User,
    role: ChatRole
}
