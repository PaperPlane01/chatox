import {makeAutoObservable} from "mobx";

export class ChatInfoDialogStore {
    chatInfoDialogOpen: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setChatInfoDialogOpen = (chatInfoDialogOpen: boolean): void => {
        this.chatInfoDialogOpen = chatInfoDialogOpen;
    };
}
