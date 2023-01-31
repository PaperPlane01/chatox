import {makeAutoObservable} from "mobx";

export class ChatsAndMessagesSearchQueryStore {
    query = "";

    showInput = false;

    constructor() {
        makeAutoObservable(this);
    }

    get searchModeActive(): boolean {
        return this.query.trim().length !== 0;
    }

    setQuery = (query: string): void => {
        this.query = query;
    };

    setShowInput = (showInput: boolean) => {
        this.showInput = showInput;
    };

    reset = (): void => {
        this.showInput = false;
        this.query = "";
    };
}