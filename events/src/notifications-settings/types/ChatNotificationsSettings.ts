import {NotificationsSettings} from "./NotificationsSettings";
import {UserNotificationException} from "./UserNotificationException";
import {Chat} from "../../common/types";

export interface ChatNotificationsSettings {
	chat: Chat,
	notificationsSettings: NotificationsSettings,
	userExceptions?: UserNotificationException[]
}
