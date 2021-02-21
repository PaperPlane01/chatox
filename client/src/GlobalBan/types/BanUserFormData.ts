import {GlobalBanReason} from "../../api/types/response";

export interface BanUserFormData {
    expiresAt?: Date,
    reason: GlobalBanReason,
    permanent: boolean,
    comment?: string
}