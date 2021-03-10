import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {Message} from "../types/response";
import {CreateMessageRequest, UpdateMessageRequest} from "../types/request";
import {CHATS, MESSAGES, PIN, PINNED, SCHEDULED, UNPIN} from "../endpoints";

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

    public static getPinnedMessageByChat(chatId: string): AxiosPromise<Message> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${MESSAGES}/${PINNED}`);
    }

    public static pinMessage(chatId: string, messageId: string): AxiosPromise<Message> {
        return axiosInstance.post(`/${CHATS}/${chatId}/${MESSAGES}/${messageId}/${PIN}`);
    }

    public static unpinMessage(chatId: string, messageId: string): AxiosPromise<Message> {
        return axiosInstance.delete(`/${CHATS}/${chatId}/${MESSAGES}/${messageId}/${UNPIN}`);
    }

    public static getScheduledMessagesByChat(chatId: string): AxiosPromise<Message[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${MESSAGES}/${SCHEDULED}`);
    }
}
