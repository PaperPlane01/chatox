import {ChatParticipationEntity} from "./ChatParticipationEntity";
import {ChatRoleEntity} from "../../ChatRole/types";
import {ChatBlockingEntity} from "../../ChatBlocking/types";

export interface ChatParticipantInfo {
    chatParticipation: ChatParticipationEntity,
    role: ChatRoleEntity,
    activeChatBlocking?: ChatBlockingEntity
}