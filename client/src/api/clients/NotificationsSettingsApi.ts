import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {CHATS, NOTIFICATIONS_SETTINGS} from "../endpoints";
import {ChatNotificationsSettings, GlobalNotificationsSettings} from "../types/response";
import {UpdateChatNotificationsSettingsRequest, UpdateGlobalNotificationsSettingsRequest} from "../types/request";

export class NotificationsSettingsApi {

	public static getGlobalNotificationsSettings(): AxiosPromise<GlobalNotificationsSettings> {
		return axiosInstance.get(`/${NOTIFICATIONS_SETTINGS}`);
	}

	public static updateGlobalNotificationsSettings(request: UpdateGlobalNotificationsSettingsRequest): AxiosPromise<GlobalNotificationsSettings> {
		return axiosInstance.put(`/${NOTIFICATIONS_SETTINGS}`, request);
	}

	public static updateNotificationsSettingsForChat(
		chatId: string,
		request: UpdateChatNotificationsSettingsRequest
	): AxiosPromise<ChatNotificationsSettings> {
		return axiosInstance.put(`/${CHATS}/${chatId}/${NOTIFICATIONS_SETTINGS}`, request);
	}

	public static deleteNotificationsSettingsForChat(chatId: string): AxiosPromise<void> {
		return axiosInstance.delete(`/${CHATS}/${chatId}/${NOTIFICATIONS_SETTINGS}`);
	}
}