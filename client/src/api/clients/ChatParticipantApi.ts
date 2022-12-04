import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {CHATS, PARTICIPANTS, SEARCH} from "../endpoints";
import {PaginationRequest} from "../types/request";
import {ChatParticipation} from "../types/response";

export class ChatParticipantApi {

    public static searchChatParticipants(chatId: string, query: string, paginationRequest: PaginationRequest): AxiosPromise<ChatParticipation[]> {
        const queryString = stringify({
            ...paginationRequest,
            query
        });

        return axiosInstance.get(`/${CHATS}/${chatId}/${PARTICIPANTS}/${SEARCH}?${queryString}`);
    }
}