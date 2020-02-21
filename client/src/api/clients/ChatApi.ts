import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {CreateChatRequest} from "../types/request";
import {AvailabilityResponse, ChatResponse} from "../types/response";
import {CHAT, IS_AVAILABLE, SLUG} from "../endpoints";

export class ChatApi {

    public static createChat(createChatRequest: CreateChatRequest): AxiosPromise<ChatResponse> {
        return axiosInstance.post(`/${CHAT}`, createChatRequest);
    }

    public static checkChatSlugAvailability(slug: string): AxiosPromise<AvailabilityResponse> {
        return axiosInstance.get(`/${CHAT}/${SLUG}/${slug}/${IS_AVAILABLE}`);
    }
}
