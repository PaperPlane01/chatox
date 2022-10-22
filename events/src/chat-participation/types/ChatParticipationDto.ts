import {User} from "../../common/types";
import {ChatRoleResponse} from "../../chat-roles";

export interface ChatParticipationDto {
    id: string,
    chatId: string,
    user: User,
    role: ChatRoleResponse
}
