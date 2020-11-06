import {ChatDeletionReason} from "../response";

export interface ChatDeleted {
    id: string,
    reason?: ChatDeletionReason,
    comment?: string
}
