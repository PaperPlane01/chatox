import {User} from "./User";
import {UserInteractionType} from "./UserInteractionType";

export interface UserInteraction {
    id: string,
    user: User,
    type: UserInteractionType,
    createdAt: string
}
