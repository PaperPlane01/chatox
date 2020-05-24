import {observable, action} from "mobx";

export class ChatBlockingsDialogStore {
    @observable
    chatBlockingsDialogOpen: boolean = false;

    @action
    setChatBlockingsDialogOpen = (chatBlockingsDialogOpen: boolean): void => {
        this.chatBlockingsDialogOpen = chatBlockingsDialogOpen;
    };
}
