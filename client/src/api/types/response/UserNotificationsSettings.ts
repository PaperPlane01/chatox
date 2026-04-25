import {User} from "./User";
import {NotificationsSettings} from "./NotificationsSettings";

export interface UserNotificationsSettings {
	user: User,
	notificationsSettings: NotificationsSettings
}
