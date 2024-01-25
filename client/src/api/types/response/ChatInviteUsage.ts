import {JoinChatRejectionReason} from "./JoinChatRejectionReason";

export interface ChatInviteUsage {
    canBeUsed: boolean,
    rejectionReason?: JoinChatRejectionReason
}
