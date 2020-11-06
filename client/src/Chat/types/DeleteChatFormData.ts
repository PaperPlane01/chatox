import {ChatDeletionReason} from "../../api/types/response";

export interface DeleteChatFormData {
    reason: ChatDeletionReason,
    comment?: string
}
