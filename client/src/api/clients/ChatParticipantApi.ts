import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {APPROVE, CHATS, PARTICIPANTS, PENDING, REJECT, SEARCH} from "../endpoints";
import {PaginationRequest, PendingChatParticipantsRequest} from "../types/request";
import {ChatParticipation, PendingChatParticipant} from "../types/response";

export class ChatParticipantApi {

    public static searchChatParticipants(chatId: string, query: string, paginationRequest: PaginationRequest): AxiosPromise<ChatParticipation[]> {
        const queryString = stringify({
            ...paginationRequest,
            query
        });

        return axiosInstance.get(`/${CHATS}/${chatId}/${PARTICIPANTS}/${SEARCH}?${queryString}`);
    }

    public static getPendingChatParticipants(chatId: string, paginationRequest: PaginationRequest): AxiosPromise<PendingChatParticipant[]> {
        const queryString = stringify(paginationRequest);
        return axiosInstance.get(`/${CHATS}/${chatId}/${PARTICIPANTS}/${PENDING}?${queryString}`);
    }

    public static approvePendingChatParticipants(chatId: string, pendingChatParticipantsRequest: PendingChatParticipantsRequest): AxiosPromise<ChatParticipation[]> {
        return axiosInstance.put(`/${CHATS}/${chatId}/${PARTICIPANTS}/${PENDING}/${APPROVE}`, pendingChatParticipantsRequest);
    }

    public static rejectPendingChatParticipants(chatId: string, pendingChatParticipantsRequest: PendingChatParticipantsRequest): AxiosPromise<void> {
        return axiosInstance.delete(`/${CHATS}/${chatId}/${PARTICIPANTS}/${PENDING}/${REJECT}`, {
            data: pendingChatParticipantsRequest
        });
    }
}