import {makeAutoObservable, reaction, runInAction} from "mobx";
import {debounce} from "lodash";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";

export class SearchMessagesStore {
    foundMessagesIds: string[] = [];

    query = "";

    showInput = false;

    pending = false;

    error?: ApiError = undefined;

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore) {
        makeAutoObservable(this);

        reaction(
            () => this.query,
            () => this.search()
        );

        this.search = debounce(this.search, 300);
    }

    setQuery = (query: string): void => {
        this.query = query;
    };

    setShowInput = (showInput: boolean): void => {
        this.showInput = showInput;
    };

    search = (): void => {
        if (!this.selectedChatId || this.query.trim().length === 0) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        MessageApi.searchMessagesInChat(this.selectedChatId, this.query)
            .then(({data}) => runInAction(() => {
                this.entities.messages.insertAll(data, {
                    skipSettingLastMessage: true,
                    skipUpdatingChat: false
                });
                this.foundMessagesIds = data.map(message => message.id);
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    };

    reset = (): void => {
        this.setQuery("");
        this.setShowInput(false);
        this.foundMessagesIds = [];
    };
}