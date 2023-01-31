import {makeAutoObservable, reaction, runInAction} from "mobx";
import {debounce} from "lodash";
import {ChatsAndMessagesSearchQueryStore} from "./ChatsAndMessagesSearchQueryStore";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {EntitiesStore} from "../../entities-store";

export class ChatsOfCurrentUserSearchStore {
    foundChats: string[] = [];

    pending = false;

    error?: ApiError = undefined;

    collapsed = false;

    get query(): string {
        return this.chatsAndMessagesSearchQuery.query;
    }

    get active(): boolean {
        return this.foundChats.length !== 0;
    }

    constructor(private readonly chatsAndMessagesSearchQuery: ChatsAndMessagesSearchQueryStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

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

    setCollapsed = (collapsed: boolean): void => {
        this.collapsed = collapsed;
    };

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
    };

    reset = (pending: boolean = false): void => {
        this.foundChats = [];
        this.pending = pending;
        this.error = undefined;
    };
}