import {makeAutoObservable, observable, ObservableMap, reaction, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {ApiError, getInitialApiErrorFromResponse, NotificationsSettingsApi} from "../../api";
import {
	ChatNotificationsSettings,
	ChatType,
	CurrentUser,
	GlobalNotificationsSettings,
	NotificationLevel,
	NotificationsSettings
} from "../../api/types/response";
import {AuthorizationStore} from "../../Authorization";
import {EntitiesStore} from "../../entities-store";


const DEFAULT_GROUP_CHATS_NOTIFICATIONS_SETTINGS: NotificationsSettings = {
	level: NotificationLevel.ALL_MESSAGES,
	sound: "happy-pop-3"
};
const DEFAULT_DIALOG_CHATS_NOTIFICATIONS_SETTINGS: NotificationsSettings = {
	level: NotificationLevel.ALL_MESSAGES,
	sound: "happy-pop-3"
};

export class NotificationsSettingsStore {
	groupChatsSettings = DEFAULT_GROUP_CHATS_NOTIFICATIONS_SETTINGS;

	dialogChatsSettings = DEFAULT_DIALOG_CHATS_NOTIFICATIONS_SETTINGS;

	groupChatsExceptions = observable.map<string, NotificationsSettings>()

	groupChatsUsersExceptions = observable.map<string, ObservableMap<string, NotificationsSettings>>();

	dialogChatsExceptions = observable.map<string, NotificationsSettings>();

	pending = false;

	error?: ApiError = undefined;

	get currentUser(): CurrentUser | undefined {
		return this.authorization.currentUser;
	}

	constructor(private readonly authorization: AuthorizationStore,
				private readonly entities: EntitiesStore) {
		makeAutoObservable(this);

		reaction(
			() => this.currentUser?.id,
			id => {
				if (id) {
					this.fetchNotificationsSettings();
				}
			}
		);
	}

	getNotificationsSettingsForChat = computedFn((chatId: string, chatType: ChatType): NotificationsSettings => {
		const notificationsSettings = chatType === ChatType.DIALOG
			? this.dialogChatsExceptions.get(chatId)
			: this.groupChatsExceptions.get(chatId);

		if (notificationsSettings) {
			return notificationsSettings;
		}

		return chatType === ChatType.DIALOG
			? this.dialogChatsSettings
			: this.groupChatsSettings;
	})

	getNotificationsSettingsForUserInChat = ((chatId: string, userId: string): NotificationsSettings | undefined => {
		const groupChatsUserExceptions = this.groupChatsUsersExceptions.get(chatId);

		if (!groupChatsUserExceptions) {
			return undefined;
		}

		return groupChatsUserExceptions.get(userId);
	})

	fetchNotificationsSettings = (): void => {
		this.pending = true;
		this.error = undefined;

		NotificationsSettingsApi.getGlobalNotificationsSettings()
			.then(({data}) => this.setNotificationsSettings(data))
			.catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
			.finally(() => runInAction(() => this.pending = false));
	}

	setNotificationsSettings = (globalNotificationsSettings: GlobalNotificationsSettings): void => {
		this.groupChatsSettings = globalNotificationsSettings.groupChats;
		this.dialogChatsSettings = globalNotificationsSettings.dialogs;
		this.setExceptionNotificationsSettingsForGroupChats(globalNotificationsSettings.groupChatsExceptions)
		this.setExceptionNotificationsSettingsForDialogChats(globalNotificationsSettings.dialogChatsExceptions)
	}

	private setExceptionNotificationsSettingsForGroupChats = (groupChatsExceptions: ChatNotificationsSettings[]): void => {
		groupChatsExceptions.forEach(groupChatException => {
			const existingChat = this.entities.chats.findByIdOptional(groupChatException.chat.id);

			if (!existingChat) {
				this.entities.chats.insert({
					...groupChatException.chat,
					unreadMentionsCount: 0,
					unreadMessagesCount: 0,
					deleted: false
				});
			}

			const userExceptions = groupChatException.userExceptions ?? [];

			userExceptions.forEach(userException => {
				this.entities.users.insert(userException.user);

				if (!this.groupChatsUsersExceptions.has(groupChatException.chat.id)) {
					this.groupChatsUsersExceptions.set(groupChatException.chat.id, observable.map());
				}

				this.groupChatsUsersExceptions
					.get(groupChatException.chat.id)!
					.set(userException.user.id, userException.notificationsSettings);
			})

			this.groupChatsExceptions.set(groupChatException.chat.id, groupChatException.notificationsSettings);
		});
	}

	private setExceptionNotificationsSettingsForDialogChats = (dialogChatsExceptions: ChatNotificationsSettings[]): void => {
		dialogChatsExceptions.forEach(dialogChatException => {
			const existingChat = this.entities.chats.findByIdOptional(dialogChatException.chat.id);

			if (!existingChat) {
				this.entities.chats.insert({
					...dialogChatException.chat,
					unreadMentionsCount: 0,
					unreadMessagesCount: 0,
					deleted: false
				});

				if (dialogChatException.chat.user) {
					this.entities.users.insert(dialogChatException.chat.user);
				}
			}

			this.dialogChatsExceptions.set(dialogChatException.chat.id, dialogChatException.notificationsSettings);
		});
	}
}
