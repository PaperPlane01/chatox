import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";

export class MessageReactionPickerStore {
    messageId: string | undefined = undefined;

    constructor() {
        makeAutoObservable(this, {}, {autoBind: true});
    }

    isExpanded = computedFn((messageId: string): boolean => this.messageId === messageId)

    expandFor(messageId: string): void {
        this.messageId = messageId;
    }

    collapsePicker(): void {
        this.messageId = undefined;
    }
}
