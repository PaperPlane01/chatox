import {makeAutoObservable, reaction, runInAction} from "mobx";
import {UserProfileStore} from "../../User";
import {UserInteractionsCount, UserInteractionType} from "../../api/types/response";
import {ApiError, getInitialApiErrorFromResponse, UserInteractionsApi} from "../../api";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";
import {computedFn} from "mobx-utils";

const DEFAULT_USER_INTERACTIONS_COUNT: UserInteractionsCount = {
    likesCount: 0,
    lovesCount: 0,
    dislikesCount: 0
};


export class UserInteractionsCountStore {
    userInteractionsCount = DEFAULT_USER_INTERACTIONS_COUNT;

    pending = false;

    error?: ApiError = undefined;

    get userId(): string | undefined {
        return this.userProfileStore.selectedUserId;
    }

    constructor(private readonly userProfileStore: UserProfileStore,
                private readonly snackbarService: SnackbarService,
                private readonly locale: LocaleStore) {
        makeAutoObservable(this);

        reaction(
            () => this.userId,
            () => {
                this.resetUserInteractionsCount();
                this.fetchUserInteractionsCount();
            }
        );
    }

    fetchUserInteractionsCount = (): void => {
        if (!this.userId) {
            return;
        }

        this.pending = false;
        this.error = undefined;

        UserInteractionsApi.getUserInteractionsCount(this.userId)
            .then(({data}) => runInAction(() => this.userInteractionsCount = data))
            .catch(error => runInAction(() => {
                this.error = getInitialApiErrorFromResponse(error);
                this.snackbarService
                    .enqueueSnackbar(this.locale.getCurrentLanguageLabel("user.interactions.count.fetch-error"));
            }))
            .finally(() => runInAction(() => this.pending = false));
    }

    resetUserInteractionsCount = (): void => {
        this.userInteractionsCount = DEFAULT_USER_INTERACTIONS_COUNT;
    }

    setUserInteractionsCount = (userId: string, userInteractionsCount: UserInteractionsCount): void => {
        if (this.userId !== userId) {
            return;
        }

        this.userInteractionsCount = userInteractionsCount;
    }

    getInteractionsCount = computedFn((type: UserInteractionType): number => {
        switch (type) {
            case UserInteractionType.LIKE:
                return this.userInteractionsCount.likesCount;
            case UserInteractionType.DISLIKE:
                return this.userInteractionsCount.dislikesCount;
            case UserInteractionType.LOVE:
            default:
                return this.userInteractionsCount.lovesCount;
        }
    })
}