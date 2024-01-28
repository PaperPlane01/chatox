import {JoinAllowanceMap} from "../../api/types/response";

export interface ChatInviteFormData {
    active: boolean,
    name?: string,
    expiresAt?: Date,
    maxUseTimes?: string,
    userId?: string,
    joinAllowanceSettings: JoinAllowanceMap
}
