import {makeAutoObservable, reaction, runInAction} from "mobx";
import {debounce} from "lodash";
import {ChatsAndMessagesSearchQueryStore} from "./ChatsAndMessagesSearchQueryStore";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {ChatListEntry} from "../../Chat";

export class AllChatsMessagesSearchStore {
    foundMessages: ChatListEntry[] = [];

    pending = false;

    error?: ApiError = undefined;

    collapsed = false;

    get query(): string {
        return this.chatsAndMessagesSearchQuery.query;
    }

    constructor(private readonly chatsAndMessagesSearchQuery: ChatsAndMessagesSearchQueryStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

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

    setCollapsed = (collapsed: boolean): void => {
        this.collapsed = collapsed;
    };

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
                this.entities.messages.insertAll(data, {skipSettingLastMessage: true});
                this.foundMessages = data.map(message => ({
                    chatId: message.chatId,
                    messageId: message.id
                }));
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => this.pending = false);
    };

    reset = (pending: boolean = false): void => {
        this.error = undefined;
        this.pending = pending;
        this.foundMessages = [];
    };
}