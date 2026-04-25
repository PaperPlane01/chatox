import {makeAutoObservable, reaction, runInAction} from "mobx";
import {NotificationsSettingsStore} from "./NotificationsSettingsStore";
import {ApiError, NotificationsSettingsApi} from "../../api";
import {UpdateGlobalNotificationsSettingsRequest, UpdateNotificationsSettingsRequest} from "../../api/types/request";
import {ChatType, NotificationLevel, NotificationSound} from "../../api/types/response";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";

type NotificationsSettingsMap = {
	[C in keyof typeof ChatType]: UpdateNotificationsSettingsRequest
}

export class UpdateGlobalNotificationsSettingsStore {
	notificationsSettingsRequests: NotificationsSettingsMap = {
		DIALOG: {
			sound: "happy-pop-3",
			level: NotificationLevel.ALL_MESSAGES
		},
		GROUP: {
			sound: "happy-pop-3",
			level: NotificationLevel.ALL_MESSAGES
		}
	};

	pending = false;

	error?: ApiError = undefined;

	constructor(private readonly notificationsSettings: NotificationsSettingsStore,
				private readonly locale: LocaleStore,
				private readonly snackbarService: SnackbarService) {
		makeAutoObservable(this);

		reaction(
			() => this.notificationsSettings.groupChatsSettings,
			groupChatsSettings => {
				this.setSound(groupChatsSettings.sound, ChatType.GROUP);
				this.setLevel(groupChatsSettings.level, ChatType.GROUP);
			}
		);

		reaction(
			() => this.notificationsSettings.dialogChatsSettings,
			dialogChatsSettings => {
				this.setSound(dialogChatsSettings.sound, ChatType.DIALOG);
				this.setLevel(dialogChatsSettings.level, ChatType.DIALOG);
			}
		);
	}

	setSound = (sound: NotificationSound, chatType: ChatType): void => {
		this.notificationsSettingsRequests[chatType].sound = sound;
	}

	setLevel = (level: NotificationLevel, chatType: ChatType): void => {
		this.notificationsSettingsRequests[chatType].level = level;
	}

	saveNotificationsSettings = (): void => {
		this.pending = true;
		this.error = undefined;

		const request: UpdateGlobalNotificationsSettingsRequest = {
			dialogChats: this.notificationsSettingsRequests.DIALOG,
			groupChats: this.notificationsSettingsRequests.GROUP
		};

		NotificationsSettingsApi.updateGlobalNotificationsSettings(request)
			.then(({data}) => {
				this.notificationsSettings.setNotificationsSettings(data);
				this.snackbarService.enqueueSnackbar(
					this.locale.getCurrentLanguageLabel("notification.settings.update.success")
				);
			})
			.finally(() => runInAction(() => this.pending = false));
	}
}