import {observable, action, computed} from "mobx";

export class ChatsAndMessagesSearchQueryStore {
    @observable
    query = "";

    @observable
    showInput = false;

    @computed
    get searchModeActive(): boolean {
        return this.query.trim().length !== 0;
    }

    @action
    setQuery = (query: string): void => {
        this.query = query;
    }

    @action
    setShowInput = (showInput: boolean) => {
        this.showInput = showInput;
    }

    @action
    reset = (): void => {
        this.showInput = false;
        this.query = "";
    }
}