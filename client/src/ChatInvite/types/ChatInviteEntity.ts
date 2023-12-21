import {JoinAllowanceMap} from "../../api/types/response";

export interface ChatInviteEntity {
    id: string,
    chatId: string,
    active: boolean,
    createdById: string,
    createdAt: Date,
    updatedById?: string,
    updatedAt?: Date,
    userId?: string,
    lastUsedAt?: Date,
    lastUsedById?: string,
    expiresAt?: Date,
    useTimes: number,
    maxUseTimes?: number,
    name?: string,
    joinAllowanceSettings: JoinAllowanceMap
}
