import {action, observable} from "mobx";

export class ChatBlockingInfoDialogStore {
    @observable
    chatBlockingId: string | undefined = undefined;

    @observable
    chatBlockingDialogOpen: boolean = false;

    @action
    setChatBlockingId = (chatBlockingId: string): void => {
        this.chatBlockingId = chatBlockingId;
    };

    @action
    setChatBlockingDialogOpen = (chatBlockingDialogOpen: boolean): void => {
        this.chatBlockingDialogOpen = chatBlockingDialogOpen;
    }
}
