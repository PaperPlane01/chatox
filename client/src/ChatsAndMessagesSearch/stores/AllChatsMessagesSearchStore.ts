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

    get searchModeActive(): boolean {
        return this.chatsAndMessagesSearchQuery.searchModeActive;
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

        reaction(
            () => this.searchModeActive,
            searchModeActive => {
                if (!searchModeActive) {
                    this.reset(false);
                }
            }
        );
    }

    setCollapsed = (collapsed: boolean): void => {
        this.collapsed = collapsed;
    }

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
                this.entities.messages.insertAll(data, {
                    skipSettingLastMessage: true,
                    skipUpdatingChat: true
                });
                this.foundMessages = data.map(message => {
                    const chat = this.entities.chats.findById(message.chatId);

                    return {
                        chatId: message.chatId,
                        messageId: message.id,
                        chatType: chat.type
                    }
                });
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    reset = (pending: boolean = false): void => {
        this.error = undefined;
        this.pending = pending;
        this.foundMessages = [];
    }
}