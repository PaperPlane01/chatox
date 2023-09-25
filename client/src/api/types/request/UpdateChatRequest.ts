import {SlowMode} from "../response";

export interface UpdateChatRequest {
    name: string,
    slug?: string,
    description?: string,
    tags: string[],
    avatarId?: string,
    slowMode?: SlowMode
}
