import {makeAutoObservable} from "mobx";

export class ChatBlockingsDialogStore {
    chatBlockingsDialogOpen: boolean = false;

    constructor() {
       makeAutoObservable(this);
    }

    setChatBlockingsDialogOpen = (chatBlockingsDialogOpen: boolean): void => {
        this.chatBlockingsDialogOpen = chatBlockingsDialogOpen;
    };
}
