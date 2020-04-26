import {ChatParticipationEntity} from "../../Chat/types";
import {ChatRole} from "../../api/types/response";

export const canBlockUsersInChat = (chatParticipation?: ChatParticipationEntity): boolean => {
    if (chatParticipation) {
        return chatParticipation.role === ChatRole.MODERATOR || chatParticipation.role === ChatRole.ADMIN;
    } else {
        return false;
    }
};
