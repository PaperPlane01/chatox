import {ChatDeletionReason} from "../response";

export interface DeleteChatRequest {
    reason: ChatDeletionReason,
    comment?: string
}
