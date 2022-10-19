import {ChatFeatures} from "./ChatFeatures";
import {User} from "../../common/types";

export interface ChatRole {
    id: string,
    name: string,
    level: number,
    chatId: string,
    default: boolean,
    features: ChatFeatures,
    createdAt: string,
    createdBy?: User,
    updatedAt?: string,
    updatedBy?: User,
}