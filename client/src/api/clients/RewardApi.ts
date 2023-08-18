import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {CreateRewardRequest, PaginationRequest, UpdateRewardRequest} from "../types/request";
import {Reward} from "../types/response";
import {ACTIVE, REWARDS} from "../endpoints";

export class RewardApi {

    public static createReward(createRewardRequest: CreateRewardRequest): AxiosPromise<Reward> {
        return axiosInstance.post(`/${REWARDS}`, createRewardRequest);
    }

    public static getAllRewards(paginationRequest: PaginationRequest): AxiosPromise<Reward[]> {
        const queryString = stringify(paginationRequest);
        return axiosInstance.get(`/${REWARDS}?${queryString}`);
    }

    public static getActiveRewards(paginationRequest: PaginationRequest): AxiosPromise<Reward[]> {
        const queryString = stringify(paginationRequest);
        return axiosInstance.get(`/${REWARDS}/${ACTIVE}?${queryString}`);
    }

    public static updateReward(rewardId: string, updateRewardRequest: UpdateRewardRequest): AxiosPromise<Reward> {
        return axiosInstance.put(`/${REWARDS}/${rewardId}`, updateRewardRequest);
    }
}
