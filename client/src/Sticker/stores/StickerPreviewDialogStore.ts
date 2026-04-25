import {makeAutoObservable} from "mobx";

export class StickerPreviewDialogStore {
	stickerId?: string;

	constructor() {
		makeAutoObservable(this, {}, {autoBind: true});
	}

	openDialog(stickerId: string): void {
		this.stickerId = stickerId;
	}

	closeDialog(): void {
		this.stickerId = undefined;
	}
}
