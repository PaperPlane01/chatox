import {observable, action, computed} from "mobx";

export class ChatsAndMessagesSearchQueryStore {
    @observable
    query = "";

    @computed
    get searchModeActive(): boolean {
        return this.query.trim().length !== 0;
    }

    @action
    setQuery = (query: string): void => {
        this.query = query;
    }

    @action
    reset = (): void => {
        this.query = "";
    }
}