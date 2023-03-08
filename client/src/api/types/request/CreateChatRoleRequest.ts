import {ChatFeatures} from "../response";

export interface CreateChatRoleRequest {
    name: string,
    level: number,
    default: boolean,
    features: ChatFeatures
}