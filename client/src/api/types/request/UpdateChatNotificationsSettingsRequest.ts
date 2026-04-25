import {UpdateNotificationsSettingsRequest} from "./UpdateNotificationsSettingsRequest";
import {NotificationLevel, NotificationSound} from "../response";

export interface UpdateChatNotificationsSettingsRequest {
	level: NotificationLevel,
	sound: NotificationSound,
	userExceptions?: {
		[userId: string]: UpdateNotificationsSettingsRequest
	}
}
