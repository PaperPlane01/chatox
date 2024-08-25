import {NotificationsSettings} from "./NotificationsSettings";
import {ChatNotificationsSettings} from "./ChatNotificationsSettings";

export interface GlobalNotificationsSettings {
	groupChats: NotificationsSettings,
	groupChatsExceptions: ChatNotificationsSettings[],
	dialogs: NotificationsSettings,
	dialogChatsExceptions: ChatNotificationsSettings[]
}
