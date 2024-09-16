import {makeAutoObservable} from "mobx";
import {SoundNotificationStore} from "./SoundNotificationStore";
import {NotificationSound} from "../../api/types/response";

interface OpenNotificationSoundSelectDialogOptions {
	title: string,
	selectedSound: NotificationSound,
	displayCloseButton: boolean,
	onSoundSelect: (sound: NotificationSound) => void,
	onBackClick?: () => void,
	onClose?: () => void
}

export class NotificationSoundSelectDialogStore {
	open = false;

	title = "";

	selectedSound: NotificationSound = "happy-pop-3";

	displayCloseButton = false;

	onSoundSelect?: (sound: NotificationSound) => void;

	onBackClick?: () => void;

	onClose?: () => void;

	constructor(private readonly soundNotification: SoundNotificationStore) {
		makeAutoObservable(this);
	}

	openDialog = (options: OpenNotificationSoundSelectDialogOptions): void => {
		this.title = options.title;
		this.selectedSound = options.selectedSound;
		this.displayCloseButton = options.displayCloseButton;
		this.onSoundSelect = options.onSoundSelect;
		this.onBackClick = options.onBackClick;
		this.onClose = options.onClose;
		this.open = true;
	}

	selectSound = (sound: NotificationSound): void => {
		this.selectedSound = sound;

		if (this.onSoundSelect) {
			this.onSoundSelect(sound);
		}

		this.soundNotification.playSound(sound);
	}

	closeDialog = (): void => {
		this.open = false;

		if (this.onClose) {
			this.onClose();
		}
	}
}
