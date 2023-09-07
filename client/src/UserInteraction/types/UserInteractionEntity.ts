import {UserInteractionType} from "../../api/types/response";

export interface UserInteractionEntity {
    id: string,
    createdAt: Date,
    userId: string,
    type: UserInteractionType
};
