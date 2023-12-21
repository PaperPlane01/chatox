import {UserVerificationLevel} from "./UserVerificationLevel";
import {JoinChatAllowance} from "./JoinChatAllowance";

export type JoinAllowanceMap = {
    [Key in UserVerificationLevel]: JoinChatAllowance
}
