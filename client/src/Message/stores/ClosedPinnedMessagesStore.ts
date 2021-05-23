import {action, observable} from "mobx";

interface ClosedPinnedMessagesMap {
    [messageId: string]: boolean
}

export class ClosedPinnedMessagesStore {
    @observable
    closePinnedMessagesMap: ClosedPinnedMessagesMap = {};

    @action
    closePinnedMessage = (messageId: string): void => {
        this.closePinnedMessagesMap[messageId] = true;
    }

    @action
    showPinnedMessage = (messageId: string): void => {
        this.closePinnedMessagesMap[messageId] = false;
    }
}
