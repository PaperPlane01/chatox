import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {BanUserRequest, GlobalBanFilters, PaginationRequest, UpdateBanRequest} from "../types/request";
import {GlobalBan} from "../types/response";
import {axiosInstance} from "../axios-instance";
import {BANS, USERS} from "../endpoints";

export class GlobalBanApi {
    public static banUser(userId: string, banUserRequest: BanUserRequest): AxiosPromise<GlobalBan> {
        return axiosInstance.post(`/${USERS}/${userId}/${BANS}`, banUserRequest);
    }

    public static updateBan(userId: string, banId: string, updateBanRequest: UpdateBanRequest): AxiosPromise<GlobalBan> {
        return axiosInstance.put(`/${USERS}/${userId}/${BANS}/${banId}`, updateBanRequest);
    }

    public static cancelBan(userId: string, banId: string): AxiosPromise<GlobalBan> {
        return axiosInstance.delete(`/${USERS}/${userId}/${BANS}/${banId}`);
    }

    public static findBans(filters: GlobalBanFilters, paginationRequest: PaginationRequest): AxiosPromise<GlobalBan[]> {
        const queryString = stringify({
            ...filters,
            ...paginationRequest
        });
        return axiosInstance.get(`/${USERS}/${BANS}?${queryString}`);
    }
}
