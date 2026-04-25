import {makeAutoObservable} from "mobx";

interface OpenDialogOptions {
	chatId: string,
	onBackClick?: () => void
}

export class UserNotificationExceptionsDialogStore {
	dialogOpen = false;

	chatId?: string = undefined;

	onBackClick?: () => void

	constructor() {
		makeAutoObservable(this);
	}

	openDialog = ({chatId, onBackClick}: OpenDialogOptions): void => {
		this.chatId = chatId;
		this.onBackClick = onBackClick;
		this.dialogOpen = true;
	}

	openDialogWithPreservedState = (): void => {
		this.dialogOpen = true;
	}

	closeDialog = (): void => {
		this.dialogOpen = false;
		this.chatId = undefined;
		this.onBackClick = undefined;
	}

	closeDialogAndPreserveState = (): void => {
		this.dialogOpen = false;
	}
}
