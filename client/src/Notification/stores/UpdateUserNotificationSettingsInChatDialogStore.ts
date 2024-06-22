import {makeAutoObservable} from "mobx";
import {UpdateChatNotificationsSettingsStore} from "./UpdateChatNotificationsSettingsStore";

interface OpenDialogOptions {
	chatId: string,
	userId: string,
	displayBackButton: boolean,
	onBackClick?: () => void
}

export class UpdateUserNotificationSettingsInChatDialogStore {
	dialogOpen = false;

	chatId?: string = undefined;

	userId?: string = undefined;

	displayBackButton = true;

	onBackClick?: () => void = undefined;

	constructor(private readonly updateChatNotificationsSettings: UpdateChatNotificationsSettingsStore) {
		makeAutoObservable(this);
	}

	openDialog = ({chatId, userId, displayBackButton, onBackClick}: OpenDialogOptions): void => {
		this.updateChatNotificationsSettings.initUserException(userId);
		this.chatId = chatId;
		this.userId = userId;
		this.displayBackButton = displayBackButton;
		this.onBackClick = onBackClick;
		this.dialogOpen = true;
	}

	openDialogWithPreservedState = (): void => {
		this.dialogOpen = true;
	}

	closeDialogAndPreserveState = (): void => {
		this.dialogOpen = false;
	}

	closeDialog = (): void => {
		this.dialogOpen = false;
		this.chatId = undefined;
		this.userId = undefined;
	}
}
