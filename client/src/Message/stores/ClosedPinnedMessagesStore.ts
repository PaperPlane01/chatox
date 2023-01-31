import {action, makeAutoObservable, observable} from "mobx";

interface ClosedPinnedMessagesMap {
    [messageId: string]: boolean
}

export class ClosedPinnedMessagesStore {
    closePinnedMessagesMap: ClosedPinnedMessagesMap = {};

    constructor() {
        makeAutoObservable(this, {
            closePinnedMessagesMap: observable,
            closePinnedMessage: action,
            showPinnedMessage: action
        });
    }

    closePinnedMessage = (messageId: string): void => {
        this.closePinnedMessagesMap[messageId] = true;
    };

    showPinnedMessage = (messageId: string): void => {
        this.closePinnedMessagesMap[messageId] = false;
    };
}
