import {GlobalBanReason} from "../response";

export interface UpdateBanRequest {
    expiresAt?: string,
    reason: GlobalBanReason,
    permanent: boolean,
    comment?: string
}
