import {NotificationLevel, NotificationSound} from "../response";

export interface UpdateNotificationsSettingsRequest {
	level: NotificationLevel,
	sound: NotificationSound
}
