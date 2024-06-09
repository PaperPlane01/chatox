import {makeAutoObservable, observable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {NotificationsSettingsStore} from "./NotificationsSettingsStore";
import {SnackbarService} from "../../Snackbar";
import {NotificationsSettingsApi} from "../../api";
import {ChatType} from "../../api/types/response";
import {LocaleStore} from "../../localization";

export class DeleteChatNotificationSettingsStore {
	pendingMap = observable.map<string, boolean>();

	constructor(private readonly notificationsSettings: NotificationsSettingsStore,
				private readonly locale: LocaleStore,
				private readonly snackbarService: SnackbarService) {
		makeAutoObservable(this);
	}

	isPending = computedFn((chatId: string): boolean => {
		return this.pendingMap.get(chatId) ?? false;
	})

	deleteNotificationsSettingsForChat = (chatId: string, chatType: ChatType): void => {
		if (this.isPending(chatId)) {
			return;
		}

		this.pendingMap.set(chatId, true);

		NotificationsSettingsApi.deleteNotificationsSettingsForChat(chatId)
			.then(() => {
				if (chatType === ChatType.DIALOG) {
					this.notificationsSettings.deleteNotificationsSettingsForDialogChat(chatId);
				} else {
					this.notificationsSettings.deleteNotificationsSettingsForGroupChat(chatId);
				}
				this.snackbarService.enqueueSnackbar(
					this.locale.getCurrentLanguageLabel("notification.settings.for-chat.delete.success")
				)
			})
			.catch(() => this.snackbarService.error(
				this.locale.getCurrentLanguageLabel("notification.settings.for-chat.delete.error")
			))
			.finally(() => runInAction(() => this.pendingMap.delete(chatId)));
	}
}
