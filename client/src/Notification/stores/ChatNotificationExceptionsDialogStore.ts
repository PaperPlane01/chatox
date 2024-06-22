import {makeAutoObservable} from "mobx";
import {ChatType} from "../../api/types/response";

export class ChatNotificationExceptionsDialogStore {
	chatNotificationExceptionsDialogOpen = false;

	chatType = ChatType.DIALOG;

	constructor() {
		makeAutoObservable(this);
	}

	openDialog = (chatType: ChatType): void => {
		this.chatType = chatType;
		this.chatNotificationExceptionsDialogOpen = true;
	}

	closeDialog = (): void => {
		this.chatNotificationExceptionsDialogOpen = false;
	}
}
