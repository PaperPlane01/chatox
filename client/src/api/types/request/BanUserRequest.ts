import {GlobalBanReason} from "../response";

export interface BanUserRequest {
    expiresAt?: string,
    reason: GlobalBanReason,
    permanent: boolean,
    comment?: string
}
