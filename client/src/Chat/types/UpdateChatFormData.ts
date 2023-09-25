import {TimeUnit} from "../../api/types/response";

export interface UpdateChatFormData {
    name: string,
    description?: string,
    tags: string[],
    slug?: string,
    slowModeEnabled: boolean,
    slowModeInterval?: string,
    slowModeUnit?: TimeUnit
}
