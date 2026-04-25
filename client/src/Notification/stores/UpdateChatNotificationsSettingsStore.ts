import {makeAutoObservable, runInAction, toJS} from "mobx";
import {NotificationsSettingsStore} from "./NotificationsSettingsStore";
import {ApiError, getInitialApiErrorFromResponse, NotificationsSettingsApi} from "../../api";
import {UpdateChatNotificationsSettingsRequest, UpdateNotificationsSettingsRequest} from "../../api/types/request";
import {ChatType, NotificationLevel, NotificationSound} from "../../api/types/response";
import {LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";

interface OpenUpdateChatNotificationSettingsDialogOptions {
	chatId: string,
	chatType: ChatType,
	displayBackButton?: boolean,
	onBackClick?: () => void
}

export class UpdateChatNotificationsSettingsStore {
	chatId?: string = undefined;

	chatType?: ChatType = undefined;

	updateChatNotificationsSettingsDialogOpen = false;

	request: UpdateChatNotificationsSettingsRequest = {
		level: NotificationLevel.ALL_MESSAGES,
		sound: "happy-pop-3"
	};

	pending = false;

	error?: ApiError = undefined;

	displayBackButton = false;

	onBackClick?: () => void;

	constructor(private readonly notificationsSettings: NotificationsSettingsStore,
				private readonly locale: LocaleStore,
				private readonly snackbarService: SnackbarService) {
		makeAutoObservable(this);
	}

	openDialog = ({chatId, chatType, displayBackButton = false, onBackClick}: OpenUpdateChatNotificationSettingsDialogOptions): void => {
		this.chatId = chatId;
		this.chatType = chatType;
		this.displayBackButton = displayBackButton;
		this.onBackClick = onBackClick;

		const notificationsSettings = this.notificationsSettings.getNotificationsSettingsForChat(chatId, chatType);
		const userExceptions = chatType === ChatType.GROUP
			? this.notificationsSettings.getUserExceptionsForChat(chatId)
			: new Map();

		const request: UpdateChatNotificationsSettingsRequest = {
			level: notificationsSettings.level,
			sound: notificationsSettings.sound
		};

		if (userExceptions.size !== 0) {
			const requestUsersMap: {[userId: string]: UpdateNotificationsSettingsRequest} = {};

			userExceptions.forEach((settings, userId) => {
				requestUsersMap[userId] = {
					level: settings.level,
					sound: settings.sound
				};
			});

			request.userExceptions = requestUsersMap;
		}

		this.request = request;
		this.updateChatNotificationsSettingsDialogOpen = true;
	}

	openDialogWithPreservedState = (): void => {
		this.updateChatNotificationsSettingsDialogOpen = true;
	}

	closeDialog = (): void => {
		this.updateChatNotificationsSettingsDialogOpen = false;
	}

	closeDialogAndResetState = (): void => {
		this.closeDialog();
		this.chatId = undefined;
		this.chatType = undefined;
		this.error = undefined;
		this.pending = false;
	}

	setSound = (sound: NotificationSound): void => {
		this.request.sound = sound;
	}

	setLevel = (level: NotificationLevel): void => {
		this.request.level = level;
	}

	initUserException = (userId: string): void => {
		if (!this.request.userExceptions) {
			this.request.userExceptions = {};
		}

		if (!this.request.userExceptions[userId]) {
			this.request.userExceptions[userId] = {
				level: this.request.level,
				sound: this.request.sound
			};
		}
	}

	setUserLevel = (userId: string, level: NotificationLevel): void => {
		if (!this.request.userExceptions?.[userId]) {
			return;
		}

		this.request.userExceptions[userId].level = level;
	}

	setUserSound = (userId: string, sound: NotificationSound): void => {
		if (!this.request.userExceptions?.[userId]) {
			return;
		}

		this.request.userExceptions[userId].sound = sound;
	}

	deleteUserException = (userId: string): void => {
		if (!this.request.userExceptions) {
			return;
		}

		delete this.request.userExceptions[userId];
	}

	updateChatNotificationsSettings = (): void => {
		if (!this.chatId || !this.chatType) {
			return;
		}

		const chatId = this.chatId;
		const chatType = this.chatType;

		this.pending = true;
		this.error = undefined;

		if (this.request.userExceptions && Object.keys(this.request.userExceptions).length === 0) {
			delete this.request.userExceptions;
		}

		NotificationsSettingsApi.updateNotificationsSettingsForChat(
			chatId,
			this.request
		)
			.then(({data}) => {
				if (chatType === ChatType.DIALOG) {
					this.notificationsSettings.setNotificationSettingsForDialogChat(chatId, data);
				} else {
					this.notificationsSettings.setNotificationsSettingsForGroupChat(chatId, data);
				}
				this.snackbarService.enqueueSnackbar(
					this.locale.getCurrentLanguageLabel("notification.settings.update.success")
				);
			})
			.catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
			.finally(() => runInAction(() => this.pending = false));
	}
}
