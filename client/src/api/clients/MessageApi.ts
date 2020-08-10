import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {Message} from "../types/response";
import {CHAT, MESSAGES} from "../endpoints";
import {CreateMessageRequest, UpdateMessageRequest} from "../types/request";

export class MessageApi {
    public static getMessagesByChat(chatId: string): AxiosPromise<Message[]> {
        return axiosInstance.get(`/${CHAT}/${chatId}/${MESSAGES}`);
    }

    public static getMessagesByChatAfterMessage(chatId: string, afterId: string): AxiosPromise<Message[]> {
        return axiosInstance.get(`/${CHAT}/${chatId}/${MESSAGES}?sinceId=${afterId}`);
    }

    public static getMessagesByChatBeforeMessage(chatId: string, beforeId: string): AxiosPromise<Message[]> {
        return axiosInstance.get(`/${CHAT}/${chatId}/${MESSAGES}?beforeId=${beforeId}`)
    }

    public static createMessage(chatId: string, createMessageRequest: CreateMessageRequest): AxiosPromise<Message> {
        return axiosInstance.post(`/${CHAT}/${chatId}/${MESSAGES}`, createMessageRequest);
    }

    public static updateMessage(chatId: string, messageId: string, updateMessageRequest: UpdateMessageRequest): AxiosPromise<Message> {
        return axiosInstance.put(`/${CHAT}/${chatId}/${MESSAGES}/${messageId}`, updateMessageRequest);
    }
}
