import {ChatFeatures} from "../response";

export interface UpdateChatRoleRequest {
    name: string,
    level: number,
    features: ChatFeatures
}