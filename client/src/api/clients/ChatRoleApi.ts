import {AxiosPromise} from "axios";
import {ChatRole} from "../types/response";
import {axiosInstance} from "../axios-instance";
import {CHATS, ROLES} from "../endpoints";
import {CreateChatRoleRequest, UpdateChatRoleRequest} from "../types/request";

export class ChatRoleApi {
    public static getRolesOfChat(chatId: string): AxiosPromise<ChatRole[]> {
        return axiosInstance.get(`/${CHATS}/${chatId}/${ROLES}`);
    }

    public static createChatRole(chatId: string, createChatRoleRequest: CreateChatRoleRequest): AxiosPromise<ChatRole> {
        return axiosInstance.post(`/${CHATS}/${chatId}/${ROLES}`, createChatRoleRequest);
    }

    public static updateChatRole(chatId: string, roleId: string, updateChatRoleRequest: UpdateChatRoleRequest): AxiosPromise<ChatRole> {
        return axiosInstance.put(`/${CHATS}/${chatId}/${ROLES}/${roleId}`, updateChatRoleRequest);
    }
}