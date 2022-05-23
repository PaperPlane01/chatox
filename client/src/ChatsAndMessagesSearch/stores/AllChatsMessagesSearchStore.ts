import {action, computed, observable, reaction, runInAction} from "mobx";
import {debounce} from "lodash";
import {ChatsAndMessagesSearchQueryStore} from "./ChatsAndMessagesSearchQueryStore";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {ChatListEntry} from "../../Chat";

export class AllChatsMessagesSearchStore {
    @observable
    foundMessages: ChatListEntry[] = [];

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

    constructor(private readonly chatsAndMessagesSearchQuery: ChatsAndMessagesSearchQueryStore,
                private readonly entities: EntitiesStore) {
        this.searchMessages = debounce(this.searchMessages, 300);

        reaction(
            () => this.query,
            () => this.searchMessages()
        );

        reaction(
            () => this.collapsed,
            () => this.searchMessages()
        );
    }

    @action
    setCollapsed = (collapsed: boolean): void => {
        this.collapsed = collapsed;
    }

    @action
    searchMessages = (): void => {
        if (this.collapsed) {
            return;
        }

        if (this.query.trim().length === 0) {
            return;
        }

        this.reset(true);

        MessageApi.searchMessagesInChatsOfCurrentUser(this.query)
            .then(({data}) => runInAction(() => {
                this.entities.insertMessages(data, true);
                this.foundMessages = data.map(message => ({
                    chatId: message.chatId,
                    messageId: message.id
                }));
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => this.pending = false);
    }

    @action
    reset = (pending: boolean = false): void => {
        this.error = undefined;
        this.pending = pending;
        this.foundMessages = [];
    }
}