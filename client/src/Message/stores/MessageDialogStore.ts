import {observable, action} from "mobx";

export class MessageDialogStore {
    @observable
    messageId?: string = undefined;

    @action
    setMessageId = (messageId?: string): void => {
        this.messageId = messageId;
    }
};
