import {action, computed, observable, reaction, runInAction} from "mobx";
import {debounce} from "lodash";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";

export class SearchMessagesStore {
    @observable
    foundMessagesIds: string[] = [];

    @observable
    query = "";

    @observable
    showInput = false;

    @observable
    pending = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        reaction(
            () => this.query,
            () => this.search()
        );

        this.search = debounce(this.search, 300);
    }

    @action
    setQuery = (query: string): void => {
        this.query = query;
    }

    @action
    setShowInput = (showInput: boolean): void => {
        this.showInput = showInput;
    }

    @action
    search = (): void => {
        if (!this.selectedChatId || this.query.trim().length === 0) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        MessageApi.searchMessagesInChat(this.selectedChatId, this.query)
            .then(({data}) => runInAction(() => {
                this.entities.insertMessages(data, true);
                this.foundMessagesIds = data.map(message => message.id);
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => this.pending = false);
    }

    @action
    reset = (): void => {
        this.setQuery("");
        this.setShowInput(false);
        this.foundMessagesIds = [];
    }
}