import {UpdateNotificationsSettingsRequest} from "./UpdateNotificationsSettingsRequest";

export interface UpdateGlobalNotificationsSettingsRequest {
	groupChats: UpdateNotificationsSettingsRequest,
	dialogChats: UpdateNotificationsSettingsRequest
}
