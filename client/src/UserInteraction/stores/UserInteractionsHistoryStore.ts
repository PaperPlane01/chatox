import {makeAutoObservable, reaction, runInAction} from "mobx";
import {v4} from "uuid";
import {ApiError, getInitialApiErrorFromResponse, UserInteractionsApi} from "../../api";
import {CurrentUser, UserInteraction, UserInteractionType} from "../../api/types/response";
import {PaginationRequest} from "../../api/types/request";
import {PaginationWithSortingState} from "../../utils/types";
import {UserProfileStore} from "../../User";
import {AuthorizationStore} from "../../Authorization";
import {EntitiesStore} from "../../entities-store";

const PAGE_SIZE = 100;
const INITIAL_PAGINATION_STATE: PaginationWithSortingState = {
    page: 0,
    pending: false,
    initiallyFetched: false,
    noMoreItems: false,
    sortingDirection: "desc",
    sortBy: "createdAt"
};

export class UserInteractionsHistoryStore {
    userInteractionsIds: string[] = [];

    paginationState = INITIAL_PAGINATION_STATE;

    error?: ApiError = undefined;

    userInteractionsHistoryDialogOpen = false;

    get userId(): string | undefined {
        return this.userProfile.selectedUserId;
    }

    get pending(): boolean {
        return this.paginationState.pending;
    }

    get paginationRequest(): PaginationRequest {
        return {
            page: this.paginationState.page,
            pageSize: PAGE_SIZE,
            sortBy: this.paginationState.sortBy,
            direction: this.paginationState.sortingDirection
        };
    }

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly userProfile: UserProfileStore,
                private readonly authorization: AuthorizationStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

        reaction(
            () => this.userId,
            () => this.reset()
        );

        reaction(
            () => this.userInteractionsHistoryDialogOpen,
            dialogOpen => {
                if (dialogOpen && !this.paginationState.initiallyFetched) {
                    this.fetchUserInteractionsHistory();
                }
            }
        );
    }

    setUserInteractionsHistoryDialogOpen = (userInteractionsHistoryDialogOpen: boolean): void => {
        this.userInteractionsHistoryDialogOpen = userInteractionsHistoryDialogOpen;
    }

    fetchUserInteractionsHistory = (): void => {
        if (!this.userId) {
            return;
        }

       if (this.paginationState.pending || this.paginationState.noMoreItems) {
           return;
       }

       this.paginationState.pending = true;

       UserInteractionsApi.getUserInteractions(this.userId, this.paginationRequest)
           .then(({data}) => runInAction(() => {
               if (!this.paginationState.initiallyFetched) {
                   this.paginationState.initiallyFetched = true;
               }

               if (data.length === 0 || data.length < PAGE_SIZE) {
                   this.paginationState.noMoreItems = true;
               } else {
                   this.paginationState.page = this.paginationState.page + 1;
               }

               this.entities.userInteractions.insertAll(data);
               this.userInteractionsIds = data.map(userInteraction => userInteraction.id);
           }))
           .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
           .finally(() => runInAction(() => this.paginationState.pending = false));
    }

    insertUserInteractionForCurrentUser = (type: UserInteractionType): void => {
        if (!this.paginationState.initiallyFetched || !this.currentUser) {
            return;
        }

        const userInteraction: UserInteraction = {
            id: v4(),
            user: {
                ...this.currentUser,
                deleted: false,
                online: true
            },
            createdAt: new Date().toISOString(),
            type
        };
        this.entities.userInteractions.insert(userInteraction);
        this.userInteractionsIds.unshift(userInteraction.id)
    }

    reset = (): void => {
        this.entities.userInteractions.deleteAll();
        this.paginationState = INITIAL_PAGINATION_STATE;
        this.userInteractionsIds = [];
        this.error = undefined;
        this.userInteractionsHistoryDialogOpen = false;
    }
}