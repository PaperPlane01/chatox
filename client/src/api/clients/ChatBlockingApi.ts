import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {CreateChatBlockingRequest, PaginationRequest} from "../types/request";
import {ChatBlocking} from "../types/response";
import {ACTIVE, BLOCKINGS, CHATS, NON_ACTIVE} from "../endpoints";
import {UpdateChatBlockingRequest} from "../types/request/UpdateChatBlockingRequest";

export class ChatBlockingApi {

    public static createChatBlocking(
        chatId: string,
        createChatBlockingRequest: CreateChatBlockingRequest
    ): AxiosPromise<ChatBlocking> {
        return axiosInstance.post(`/${CHATS}/${chatId}/${BLOCKINGS}`, createChatBlockingRequest);
    }

    public static findActiveBlockingsByChat(chatId: string, paginationRequest: PaginationRequest): AxiosPromise<ChatBlocking[]> {
        const queryString = stringify(paginationRequest);
        return axiosInstance.get(`/${CHATS}/${chatId}/${BLOCKINGS}/${ACTIVE}?${queryString}`);
    }

    public static findAllChatBlockingsByChat(chatId: string, paginationRequest: PaginationRequest): AxiosPromise<ChatBlocking[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${BLOCKINGS}?${stringify(paginationRequest)}`);
    }

    public static findNonActiveBlockingsByChat(chatId: string, paginationRequest: PaginationRequest): AxiosPromise<ChatBlocking[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${BLOCKINGS}/${NON_ACTIVE}?${stringify(paginationRequest)}`);
    }

    public static findChatBlockingById(chatId: string, chatBlockingId: string): AxiosPromise<ChatBlocking> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${BLOCKINGS}/${chatBlockingId}`);
    }

    public static cancelChatBlocking(chatId: string, chatBlockingId: string): AxiosPromise<ChatBlocking> {
        return axiosInstance.delete(`/${CHATS}/${chatId}/${BLOCKINGS}/${chatBlockingId}`);
    }

    public static updateChatBlocking(
        chatId: string,
        chatBlockingId: string,
        updateChatBlockingRequest: UpdateChatBlockingRequest
    ): AxiosPromise<ChatBlocking> {
        return axiosInstance.put(`/${CHATS}/${chatId}/${BLOCKINGS}/${chatBlockingId}`, updateChatBlockingRequest);
    }
}
