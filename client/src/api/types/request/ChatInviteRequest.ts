import {JoinAllowanceMap} from "../response";

export interface ChatInviteRequest {
    active: boolean,
    name?: string,
    expiresAt?: string,
    maxUseTimes?: number,
    userId?: string,
    joinAllowanceSettings: JoinAllowanceMap
}
