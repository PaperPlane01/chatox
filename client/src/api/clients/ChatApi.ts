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
import {CHATS, IS_AVAILABLE, JOIN, LEAVE, MY, ONLINE, PARTICIPANTS, SLUG} from "../endpoints";
import {UpdateChatRequest} from "../types/request/UpdateChatRequest";

export class ChatApi {

    public static createChat(createChatRequest: CreateChatRequest): AxiosPromise<ChatOfCurrentUser> {
        return axiosInstance.post(`/${CHATS}`, createChatRequest);
    }

    public static checkChatSlugAvailability(slug: string): AxiosPromise<AvailabilityResponse> {
        return axiosInstance.get(`/${CHATS}/${SLUG}/${slug}/${IS_AVAILABLE}`);
    }

    public static getChatsOfCurrentUser(): AxiosPromise<ChatOfCurrentUser[]> {
        return axiosInstance.get(`/${CHATS}/${MY}`);
    }

    public static joinChat(chatId: string): AxiosPromise<ChatParticipationWithoutUser> {
        return axiosInstance.post(`/${CHATS}/${chatId}/${JOIN}`);
    }

    public static leaveChat(chatId: string): AxiosPromise<void> {
        return axiosInstance.delete(`/${CHATS}/${chatId}/${LEAVE}`);
    }

    public static findChatByIdOrSlug(idOrSlug: string): AxiosPromise<Chat> {
        return axiosInstance.get(`/${CHATS}/${idOrSlug}`);
    }

    public static getChatParticipants(chatId: string, page: number): AxiosPromise<ChatParticipation[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${PARTICIPANTS}?page=${page}`);
    }

    public static getOnlineChatParticipants(chatId: string): AxiosPromise<ChatParticipation[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${PARTICIPANTS}/${ONLINE}`);
    }

    public static updateChat(chatId: string, updateChatRequest: UpdateChatRequest): AxiosPromise<ChatOfCurrentUser> {
        return axiosInstance.put(`/${CHATS}/${chatId}`, updateChatRequest);
    }
}
