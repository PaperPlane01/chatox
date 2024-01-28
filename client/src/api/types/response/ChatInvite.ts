import {User} from "./User";
import {JoinAllowanceMap} from "./JoinAllowanceMap";

export interface ChatInvite {
    id: string,
    chatId: string,
    createdAt: string,
    createdBy: User,
    updatedAt?: string,
    updatedBy?: User,
    user?: User,
    active: boolean,
    lastUsedAt?: string,
    lastUsedBy?: User,
    expiresAt?: string,
    useTimes: number,
    maxUseTimes?: number,
    name?: string,
    joinAllowanceSettings: JoinAllowanceMap
}