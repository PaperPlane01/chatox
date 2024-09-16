import {NotificationsSettings} from "./NotificationsSettings";
import {User} from "../../common/types";

export interface UserNotificationException {
	user: User,
	notificationsSettings: NotificationsSettings
}
