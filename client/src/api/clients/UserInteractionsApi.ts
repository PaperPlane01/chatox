import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {UserInteraction, UserInteractionCost, UserInteractionsCount} from "../types/response";
import {COSTS, COUNT, DISLIKE, INTERACTIONS, LIKE, LOVE, USERS} from "../endpoints";
import {PaginationRequest} from "../types/request";

export class UserInteractionsApi {

    public static getUserInteractionCosts(): AxiosPromise<UserInteractionCost[]> {
        return axiosInstance.get(`/${USERS}/${INTERACTIONS}/${COSTS}`);
    }

    public static getUserInteractions(userId: string,
                                      paginationRequest: PaginationRequest): AxiosPromise<UserInteraction[]> {
        const requestParameters = stringify(paginationRequest);

        return axiosInstance.get(`/${USERS}/${userId}/${INTERACTIONS}?${requestParameters}`);
    }
    public static getUserInteractionsCount(userId: string): AxiosPromise<UserInteractionsCount> {
        return axiosInstance.get(`/${USERS}/${userId}/${INTERACTIONS}/${COUNT}`);
    }

    public static createUserLike(userId: string): AxiosPromise<UserInteractionsCount> {
        return axiosInstance.post(`/${USERS}/${userId}/${LIKE}`);
    }

    public static createUserDislike(userId: string): AxiosPromise<UserInteractionsCount> {
        return axiosInstance.post(`/${USERS}/${userId}/${DISLIKE}`);
    }

    public static createUserLove(userId: string): AxiosPromise<UserInteractionsCount> {
        return axiosInstance.post(`/${USERS}/${userId}/${LOVE}`);
    }
}