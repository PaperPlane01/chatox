import {makeAutoObservable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {ForwardMessagesRequest} from "../../api/types/request";
import {EntitiesStore} from "../../entities-store";
import {ChatStore} from "../../Chat";
import {AxiosError} from "axios";

export class ForwardMessagesStore {
    forwardedMessagesIds: string[] = [];

    pending = false;

    error?: ApiError = undefined;

    forwardedFromChatId?: string = undefined;

    get chatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    get forwardModeActive(): boolean {
        return this.forwardedMessagesIds.length !== 0;
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    addMessage = (messageId: string): void => {
        this.forwardedMessagesIds.push(messageId);
    }

    removeMessage = (messageId: string): void => {
        this.forwardedMessagesIds = this.forwardedMessagesIds.filter(id => id !== messageId);

        if (!this.forwardModeActive) {
            this.setForwardedFromChatId(undefined);
        }
    }

    isMessageForwarded = computedFn((messageId: string): boolean => this.forwardedMessagesIds.includes(messageId))

    setForwardedFromChatId = (forwardedFromChatId?: string): void => {
        this.forwardedFromChatId = forwardedFromChatId;
    }

    reset = (): void => {
        this.forwardedMessagesIds = [];
        this.forwardedFromChatId = undefined;
    }

    forwardMessages = async (): Promise<Date | undefined> => {
        if (!this.chatId || this.forwardedMessagesIds.length === 0) {
            return;
        }

        const request: ForwardMessagesRequest = {
            forwardedMessagesIds: this.forwardedMessagesIds
        };
        this.pending = true;
        this.error = undefined;

        try {
            const {data} = await MessageApi.forwardMessages(this.chatId, request);
            this.entities.messages.insertAll(data);
            this.reset();

            return new Date(data[data.length - 1].createdAt);
        } catch (error) {
            runInAction(() => this.error = getInitialApiErrorFromResponse(error as AxiosError));
        } finally {
            runInAction(() => this.pending = false);
        }
    }
}