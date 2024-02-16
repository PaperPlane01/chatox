import {UploadResponse} from "../../../uploads/types";

export interface ChatResponse {
    description?: string;
    id: string;
    name: string;
    participantsCount: number;
    onlineParticipantsCount: number;
    slug?: string;
    tags: string[];
    createdAt: string;
    avatar: UploadResponse;
    createdById: string;
}
