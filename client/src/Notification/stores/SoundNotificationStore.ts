import {makeAutoObservable} from "mobx";
import {NotificationsSettingsStore} from "./NotificationsSettingsStore";
import {ChatStore} from "../../Chat";
import {EntitiesStore} from "../../entities-store";
import {MessageEntity} from "../../Message";
import {AuthorizationStore} from "../../Authorization";
import {
	ChatType,
	CurrentUser,
	NotificationLevel,
	NotificationSound,
	NotificationsSettings
} from "../../api/types/response";

export class SoundNotificationStore {
	get currentUser(): CurrentUser | undefined {
		return this.authorization.currentUser;
	}

	constructor(private readonly notificationsSettings: NotificationsSettingsStore,
				private readonly chat: ChatStore,
				private readonly authorization: AuthorizationStore,
				private readonly entities: EntitiesStore) {
		makeAutoObservable(this)
	}

	playSoundForMessage = (message: MessageEntity): void => {
		const chat = this.entities.chats.findByIdOptional(message.chatId);

		if (!chat) {
			return;
		}

		if (this.chat.selectedChatId === chat.id) {
			return;
		}

		const chatNotificationsSettings = this.notificationsSettings.getNotificationsSettingsForChat(chat.id, chat.type);
		let userNotificationsSettings: NotificationsSettings | undefined = undefined;

		if (chat.type === ChatType.GROUP) {
			userNotificationsSettings = this.notificationsSettings.getNotificationsSettingsForUserInChat(
				chat.id,
				message.sender
			);
		}

		const finalNotificationsSettings = userNotificationsSettings ?? chatNotificationsSettings;

		if (finalNotificationsSettings.level === NotificationLevel.MUTED) {
			return;
		} else if (finalNotificationsSettings.level === NotificationLevel.ALL_MESSAGES) {
			this.playSound(finalNotificationsSettings.sound);
		} else if (this.currentUser) {
			if (message.mentionedUsers.includes(this.currentUser.id)) {
				this.playSound(finalNotificationsSettings.sound);
			} else if (message.referredMessageId) {
				const referredMessage = this.entities.messages.findByIdOptional(message.referredMessageId);

				if (referredMessage?.sender === this.currentUser.id) {
					this.playSound(finalNotificationsSettings.sound);
				}
			}
		}
	}

	playSound = (notificationSound: NotificationSound): void => {
		const audio = new Audio(`/sounds/${notificationSound}.mp3`);
		audio.play();
	}
}