import {Chat} from "./Chat";
import {NotificationsSettings} from "./NotificationsSettings";
import {UserNotificationsSettings} from "./UserNotificationsSettings";

export interface ChatNotificationsSettings {
	chat: Chat,
	notificationsSettings: NotificationsSettings,
	userExceptions?: UserNotificationsSettings[]
}
