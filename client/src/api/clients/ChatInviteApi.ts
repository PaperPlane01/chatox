import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {CHATS, INVITES} from "../endpoints";
import {ChatInvite, ChatInviteMinified} from "../types/response";
import {CreateChatInviteRequest, PaginationRequest, UpdateChatInviteRequest} from "../types/request";

export class ChatInviteApi {
    public static getChatInvites(chatId: string, paginationRequest: PaginationRequest): AxiosPromise<ChatInvite[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${INVITES}?${stringify(paginationRequest)}`);
    }

    public static createChatInvite(chatId: string, createChatInviteRequest: CreateChatInviteRequest): AxiosPromise<ChatInvite> {
        return axiosInstance.post(`/${CHATS}/${chatId}/${INVITES}`, createChatInviteRequest);
    }

    public static updateChatInvite(chatId: string, inviteId: string, updateChatInviteRequest: UpdateChatInviteRequest): AxiosPromise<ChatInvite> {
        return axiosInstance.put(`/${CHATS}/${chatId}/${INVITES}/${inviteId}`, updateChatInviteRequest);
    }

    public static getChatInvite(chatId: string, inviteId: string): AxiosPromise<ChatInvite> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${INVITES}/${inviteId}`);
    }

    public static getChatInviteById(inviteId: string): AxiosPromise<ChatInviteMinified> {
        return axiosInstance.get(`/${CHATS}/${INVITES}/${inviteId}`);
    }
}