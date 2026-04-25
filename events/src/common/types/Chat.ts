import {Upload} from "./Upload";
import {User} from "./User";

export interface Chat {
    id: string,
    name: string,
    slug?: string,
    tags: string[],
    avatar: Upload,
    description: string,
    createdAt: string,
    participantsCount?: number,
    onlineParticipantsCount?: number,
    user?: User
}
