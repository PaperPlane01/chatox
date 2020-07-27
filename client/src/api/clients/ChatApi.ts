import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {CreateChatRequest} from "../types/request";
import {
    AvailabilityResponse,
    Chat,
    ChatOfCurrentUser,
    ChatParticipation,
    ChatParticipationWithoutUser
} from "../types/response";
import {CHAT, IS_AVAILABLE, JOIN, LEAVE, MY, ONLINE, PARTICIPANTS, SLUG} from "../endpoints";
import {UpdateChatRequest} from "../types/request/UpdateChatRequest";

export class ChatApi {

    public static createChat(createChatRequest: CreateChatRequest): AxiosPromise<ChatOfCurrentUser> {
        return axiosInstance.post(`/${CHAT}`, createChatRequest);
    }

    public static checkChatSlugAvailability(slug: string): AxiosPromise<AvailabilityResponse> {
        return axiosInstance.get(`/${CHAT}/${SLUG}/${slug}/${IS_AVAILABLE}`);
    }

    public static getChatsOfCurrentUser(): AxiosPromise<ChatOfCurrentUser[]> {
        return axiosInstance.get(`/${CHAT}/${MY}`);
    }

    public static joinChat(chatId: string): AxiosPromise<ChatParticipationWithoutUser> {
        return axiosInstance.post(`/${CHAT}/${chatId}/${JOIN}`);
    }

    public static leaveChat(chatId: string): AxiosPromise<void> {
        return axiosInstance.delete(`/${CHAT}/${chatId}/${LEAVE}`);
    }

    public static findChatByIdOrSlug(idOrSlug: string): AxiosPromise<Chat> {
        return axiosInstance.get(`/${CHAT}/${idOrSlug}`);
    }

    public static getChatParticipants(chatId: string, page: number): AxiosPromise<ChatParticipation[]> {
        return axiosInstance.get(`/${CHAT}/${chatId}/${PARTICIPANTS}?page=${page}`);
    }

    public static getOnlineChatParticipants(chatId: string): AxiosPromise<ChatParticipation[]> {
        return axiosInstance.get(`/${CHAT}/${chatId}/${PARTICIPANTS}/${ONLINE}`);
    }

    public static updateChat(chatId: string, updateChatRequest: UpdateChatRequest): AxiosPromise<ChatOfCurrentUser> {
        return axiosInstance.put(`/${CHAT}/${chatId}`, updateChatRequest);
    }
}
