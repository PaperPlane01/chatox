export enum JoinChatAllowance {
    NOT_ALLOWED = "NOT_ALLOWED",
    REQUIRES_APPROVAL = "REQUIRES_APPROVAL",
    INVITE_ONLY = "INVITE_ONLY",
    ALLOWED = "ALLOWED"
}

export const JOIN_CHAT_ALLOWANCES = [
    JoinChatAllowance.NOT_ALLOWED,
    JoinChatAllowance.REQUIRES_APPROVAL,
    JoinChatAllowance.INVITE_ONLY,
    JoinChatAllowance.ALLOWED
];
