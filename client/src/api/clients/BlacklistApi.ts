import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {BlacklistStatus, User} from "../types/response";
import {USERS, ME, BLACKLIST, STATUS} from "../endpoints";

export class BlacklistApi {
    public static getBlacklistOfCurrentUser(): AxiosPromise<User[]> {
        return axiosInstance.get(`/${USERS}/${ME}/${BLACKLIST}`)
    }

    public static addUserToBlacklist(userId: string): AxiosPromise<User[]> {
        return axiosInstance.post(`/${USERS}/${userId}/${BLACKLIST}`);
    }

    public static removeUserFromBlacklist(userId: string): AxiosPromise<User[]> {
        return axiosInstance.delete(`/${USERS}/${userId}/${BLACKLIST}`);
    }

    public static isCurrentUserBlacklistedBy(userId: string): AxiosPromise<BlacklistStatus> {
        return axiosInstance.get(`/${USERS}/${userId}/${BLACKLIST}/${STATUS}`);
    }
}