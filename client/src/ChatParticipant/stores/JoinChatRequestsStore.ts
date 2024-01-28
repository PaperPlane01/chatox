import {makeAutoObservable, reaction, runInAction} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatParticipantApi, getInitialApiErrorFromResponse} from "../../api";
import {PaginationState} from "../../utils/types";
import {ChatStore} from "../../Chat";
import {computedFn} from "mobx-utils";

const INITIAL_PAGINATION_STATE: PaginationState = {
    page: 0,
    pending: false,
    initiallyFetched: false,
    noMoreItems: false
};
const PAGE_SIZE = 100;

export class JoinChatRequestsStore {
    joinChatRequestsIds: string[] = [];

    selectedJoinChatRequestsIds: string[] = [];

    paginationState = INITIAL_PAGINATION_STATE;

    waitingForChat: boolean = false;

    error?: ApiError = undefined;

    get selectedChatId(): string | undefined {
        return this.chat.selectedChatId;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly chat: ChatStore) {
        makeAutoObservable(this);

        reaction(
            () => this.selectedChatId,
            chatId => {
                if (chatId && this.waitingForChat) {
                    this.fetchJoinChatRequests();
                } else {
                    this.reset();
                }
            }
        );
    }

    fetchJoinChatRequests = (): void => {
        if (!this.selectedChatId) {
            this.setWaitingForChat(this.chat.pending);
            return;
        }

        this.paginationState.pending = true;
        this.error = undefined;

        ChatParticipantApi.getPendingChatParticipants(
            this.selectedChatId,
            {
                page: this.paginationState.page,
                pageSize: PAGE_SIZE
            }
        )
            .then(({data}) => runInAction(() => {
                if (data.length === PAGE_SIZE) {
                    this.paginationState.page = this.paginationState.page + 1;
                }
                this.entities.pendingChatParticipations.insertAll(data);
                this.joinChatRequestsIds = data.map(pendingChatParticipant => pendingChatParticipant.id);
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => {
                this.paginationState.pending = false;
                this.setWaitingForChat(false);
            }));
    }

    setWaitingForChat = (waitingForChat: boolean): void => {
        this.waitingForChat = waitingForChat;
    }

    selectRequest = (id: string): void => {
        this.selectedJoinChatRequestsIds.push(id);
    }

    unselectRequest = (id: string): void => {
        this.selectedJoinChatRequestsIds = this.selectedJoinChatRequestsIds
            .filter(requestId => requestId !== id);
    }

    removeRequests = (ids: string[]): void => {
        this.selectedJoinChatRequestsIds = this.selectedJoinChatRequestsIds
            .filter(id => !ids.includes(id));
        this.joinChatRequestsIds = this.joinChatRequestsIds
            .filter(id => !ids.includes(id));
    }

    isSelected = computedFn((id: string): boolean => this.selectedJoinChatRequestsIds.includes(id))

    reset = (): void => {
        this.paginationState = INITIAL_PAGINATION_STATE;
        this.joinChatRequestsIds = [];
        this.selectedJoinChatRequestsIds = [];
        this.entities.pendingChatParticipations.deleteAll();
    }
}