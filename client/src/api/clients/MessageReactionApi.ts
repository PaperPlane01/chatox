import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {PaginationRequest} from "../types/request";
import {MessageReaction} from "../types/response";
import {CHATS, MESSAGES, REACTIONS} from "../endpoints";

export class MessageReactionApi {

    public static createMessageReaction(chatId: string, messageId: string, emojiId: string): AxiosPromise<MessageReaction> {
        return axiosInstance.post(`/${CHATS}/${chatId}/${MESSAGES}/${messageId}/${REACTIONS}/${emojiId}`);
    }

    public static deleteMessageReaction(chatId: string, messageId: string, emojiId: string): AxiosPromise<void> {
        return axiosInstance.delete(`/${CHATS}/${chatId}/${MESSAGES}/${messageId}/${REACTIONS}/${emojiId}`);
    }

    public static getMessageReactions(
        chatId: string,
        messageId: string,
        paginationRequest: PaginationRequest
    ): AxiosPromise<Array<MessageReaction>> {
        const queryString = stringify(paginationRequest);
        return axiosInstance.get(`/${CHATS}/${chatId}/${MESSAGES}/${messageId}/${REACTIONS}?${queryString}`);
    }

    public static getMessageReactionsByEmojiId(
        chatId: string,
        messageId: string,
        emojiId: string,
        paginationRequest: PaginationRequest
    ): AxiosPromise<Array<MessageReaction>> {
        const queryString = stringify(paginationRequest);
        return axiosInstance.get(`/${CHATS}/${chatId}/${MESSAGES}/${messageId}/${REACTIONS}/${emojiId}?${queryString}`);
    }
}