import {ChatNotificationsSettings} from "../ChatNotificationsSettings";

export interface ChatNotificationsSettingsUpdated {
	userId: string,
	notificationsSettings: ChatNotificationsSettings
}
