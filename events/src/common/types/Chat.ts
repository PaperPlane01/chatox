import {Upload} from "./Upload";

export interface Chat {
    id: string,
    name: string,
    slug?: string,
    tags: string[],
    avatar: Upload,
    description: string,
    createdAt: string
}
