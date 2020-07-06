import {ImageUploadMetadata, Upload} from "../response";

export interface ChatUpdated {
    id: string,
    name: string,
    slug?: string,
    tags: string[],
    avatar: Upload<ImageUploadMetadata>,
    description: string,
    createdAt: string
}
