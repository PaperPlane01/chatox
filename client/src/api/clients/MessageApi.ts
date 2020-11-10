import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {Message} from "../types/response";
import {CHATS, MESSAGES} from "../endpoints";
import {CreateMessageRequest, UpdateMessageRequest} from "../types/request";

export class MessageApi {
    public static getMessagesByChat(chatId: string): AxiosPromise<Message[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${MESSAGES}`);
    }

    public static getMessagesByChatAfterMessage(chatId: string, afterId: string): AxiosPromise<Message[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${MESSAGES}?sinceId=${afterId}`);
    }

    public static getMessagesByChatBeforeMessage(chatId: string, beforeId: string): AxiosPromise<Message[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${MESSAGES}?beforeId=${beforeId}`)
    }

    public static createMessage(chatId: string, createMessageRequest: CreateMessageRequest): AxiosPromise<Message> {
        return axiosInstance.post(`/${CHATS}/${chatId}/${MESSAGES}`, createMessageRequest);
    }

    public static updateMessage(chatId: string, messageId: string, updateMessageRequest: UpdateMessageRequest): AxiosPromise<Message> {
        return axiosInstance.put(`/${CHATS}/${chatId}/${MESSAGES}/${messageId}`, updateMessageRequest);
    }

    public static deleteMessage(chatId: string, messageId: string): AxiosPromise<void> {
        return axiosInstance.delete(`/${CHATS}/${chatId}/${MESSAGES}/${messageId}`);
    }
}
