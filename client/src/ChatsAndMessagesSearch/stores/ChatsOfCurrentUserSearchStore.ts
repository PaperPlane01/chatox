import {action, computed, observable, reaction, runInAction} from "mobx";
import {debounce} from "lodash";
import {ChatsAndMessagesSearchQueryStore} from "./ChatsAndMessagesSearchQueryStore";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class ChatsOfCurrentUserSearchStore {
    @observable
    foundChats: string[] = [];

    @observable
    pending = false;

    @observable
    error?: ApiError = undefined;

    @observable
    collapsed = false;

    @computed
    get query(): string {
        return this.chatsAndMessagesSearchQuery.query;
    }

    @computed
    get active(): boolean {
        return this.foundChats.length !== 0;
    }

    constructor(private readonly chatsAndMessagesSearchQuery: ChatsAndMessagesSearchQueryStore,
                private readonly entities: EntitiesStore) {
        this.searchChats = debounce(this.searchChats, 300);

        reaction(
            () => this.query,
            () => this.searchChats()
        );

        reaction(
            () => this.collapsed,
            () => this.searchChats()
        );
    }

    @action
    setCollapsed = (collapsed: boolean): void => {
        this.collapsed = collapsed;
    }

    @action
    searchChats = (): void => {
        if (this.collapsed) {
            return;
        }

        if (this.query.trim().length === 0) {
            return;
        }

        this.reset(true);

        ChatApi.searchChatsOfCurrentUser(this.query)
            .then(({data}) => runInAction(() => {
                this.entities.chats.insertAll(data);
                this.foundChats = data.map(chat => chat.id);
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    @action
    reset = (pending: boolean = false): void => {
        this.foundChats = [];
        this.pending = pending;
        this.error = undefined;
    }
}