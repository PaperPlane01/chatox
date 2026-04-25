import {NotificationsSettings} from "../NotificationsSettings";

export interface GlobalNotificationsSettingsUpdated {
	userId: string,
	groupChatSettings: NotificationsSettings,
	dialogChatSettings: NotificationsSettings
}
