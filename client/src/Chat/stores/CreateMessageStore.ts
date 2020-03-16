import {action, reaction, observable, computed} from "mobx";
import {ChatStore} from "./ChatStore";

export class CreateMessageStore {
    @observable
    text: string = "";

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly chatStore: ChatStore) {}
}
