import {ChatFeatures} from "../../api/types/response";

export interface ChatRoleEntity {
    id: string,
    name: string,
    level: number,
    chatId: string,
    default: boolean,
    features: ChatFeatures,
    createdAt: Date,
    createdById?: string,
    updatedAt?: Date,
    updatedById?: string,
}