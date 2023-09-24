import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {
    CreateChatRequest,
    DeleteChatRequest,
    DeleteMultipleMessagesRequest,
    PaginationRequest,
    StartPrivateChatRequest,
    UpdateChatParticipantRequest,
    UpdateChatRequest
} from "../types/request";
import {
    AvailabilityResponse,
    Chat,
    ChatDeletionReason,
    ChatOfCurrentUser,
    ChatParticipation,
    ChatParticipationWithoutUser
} from "../types/response";
import {CHATS, IS_AVAILABLE, JOIN, LEAVE, MY, ONLINE, PARTICIPANTS, POPULAR, PRIVATE, SLUG, TYPING} from "../endpoints";

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

    public static searchChatsOfCurrentUser(query: String): AxiosPromise<Chat[]> {
        return axiosInstance.get(`/${CHATS}/${MY}?query=${query}`);
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

    public static getPopularChats(paginationRequest: PaginationRequest): AxiosPromise<Chat[]> {
        delete paginationRequest.sortBy;
        delete paginationRequest.sortingDirection;

        if (!paginationRequest.page) paginationRequest.page = 0;
        if (!paginationRequest.pageSize) paginationRequest.pageSize = 10;

        const queryString = stringify(paginationRequest);

        return axiosInstance.get(`/${CHATS}/${POPULAR}?${queryString}`);
    }

    public static deleteChatParticipation(chatId: string, chatParticipationId: string): AxiosPromise<void> {
        return axiosInstance.delete(`/${CHATS}/${chatId}/${PARTICIPANTS}/${chatParticipationId}`);
    }

    public static deleteChat(chatId: string, deleteChatRequest?: DeleteChatRequest): AxiosPromise<void> {
        return axiosInstance.delete(`/${CHATS}/${chatId}`, {
            // Need to send dummy request body here because otherwise Axios will not send
            // content-type header properly and the request will be rejected by Spring backend
            data: deleteChatRequest ? deleteChatRequest : {reason: ChatDeletionReason.SPAM},
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    public static updateChatParticipant(chatId: string, chatParticipantId: string, updateChatParticipantRequest: UpdateChatParticipantRequest): AxiosPromise<ChatParticipation> {
        return axiosInstance.put(`/${CHATS}/${chatId}/${PARTICIPANTS}/${chatParticipantId}`, updateChatParticipantRequest);
    }

    public static deleteMultipleChats(deleteMultipleChatsRequest: DeleteMultipleMessagesRequest): AxiosPromise<void> {
        return axiosInstance.delete(`/${CHATS}`, {data: deleteMultipleChatsRequest});
    }

    public static startPrivateChat(startPrivateChatRequest: StartPrivateChatRequest): AxiosPromise<ChatOfCurrentUser> {
        return axiosInstance.post(`/${CHATS}/${PRIVATE}`, startPrivateChatRequest);
    }

    public static startTyping(chatId: string): AxiosPromise<void> {
        return axiosInstance.post(`/${CHATS}/${chatId}/${TYPING}`);
    }
}
