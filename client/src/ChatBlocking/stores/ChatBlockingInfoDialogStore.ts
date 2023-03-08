import {makeAutoObservable} from "mobx";

export class ChatBlockingInfoDialogStore {
    chatBlockingId: string | undefined = undefined;

    chatBlockingDialogOpen: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setChatBlockingId = (chatBlockingId: string): void => {
        this.chatBlockingId = chatBlockingId;
    };

    setChatBlockingDialogOpen = (chatBlockingDialogOpen: boolean): void => {
        this.chatBlockingDialogOpen = chatBlockingDialogOpen;
    };
}
