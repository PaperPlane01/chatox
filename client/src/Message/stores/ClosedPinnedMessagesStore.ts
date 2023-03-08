import {makeAutoObservable} from "mobx";

interface ClosedPinnedMessagesMap {
    [messageId: string]: boolean
}

export class ClosedPinnedMessagesStore {
    closePinnedMessagesMap: ClosedPinnedMessagesMap = {};

    constructor() {
        makeAutoObservable(this);
    }

    closePinnedMessage = (messageId: string): void => {
        this.closePinnedMessagesMap[messageId] = true;
    };

    showPinnedMessage = (messageId: string): void => {
        this.closePinnedMessagesMap[messageId] = false;
    };
}
