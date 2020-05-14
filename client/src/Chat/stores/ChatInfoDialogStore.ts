import {action, observable} from "mobx";

export class ChatInfoDialogStore {
    @observable
    chatInfoDialogOpen: boolean = false;

    @action
    setChatInfoDialogOpen = (chatInfoDialogOpen: boolean): void => {
        this.chatInfoDialogOpen = chatInfoDialogOpen;
    };
}
