import {BanUserRequest} from "./BanUserRequest";

export interface BanMultipleUsersRequest {
    bans: Array<BanUserRequest & {userId: string}>
}
