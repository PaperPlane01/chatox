import {makeAutoObservable, runInAction} from "mobx";
import {AxiosPromise} from "axios";
import {UserInteractionsCountStore} from "./UserInteractionsCountStore";
import {UserInteractionCostsStore} from "./UserInteractionCostsStore";
import {UserInteractionsHistoryStore} from "./UserInteractionsHistoryStore";
import {BalanceStore} from "../../Balance";
import {AuthorizationStore} from "../../Authorization";
import {LocaleStore} from "../../localization";
import {UserProfileStore} from "../../User";
import {ApiError, getInitialApiErrorFromResponse, UserInteractionsApi} from "../../api";
import {Currency, CurrentUser, UserInteractionsCount, UserInteractionType, UserRole} from "../../api/types/response";
import {isDefined} from "../../utils/object-utils";
import {SnackbarService} from "../../Snackbar";

type CreateUserInteractionFunctionMap = {
    [key in UserInteractionType]: (userId: string) => AxiosPromise<UserInteractionsCount>
}

const CREATE_USER_INTERACTION_FUNCTIONS: CreateUserInteractionFunctionMap = {
    [UserInteractionType.LIKE]: UserInteractionsApi.createUserLike,
    [UserInteractionType.DISLIKE]: UserInteractionsApi.createUserDislike,
    [UserInteractionType.LOVE]: UserInteractionsApi.createUserLove
};

export class CreateUserInteractionStore {
    pending = false;

    error?: ApiError = undefined;

    get userId(): string | undefined {
        return this.userProfile.selectedUserId;
    }

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser
    }

    constructor(private readonly userInteractionsCount: UserInteractionsCountStore,
                private readonly userInteractionsCosts: UserInteractionCostsStore,
                private readonly userInteractionHistory: UserInteractionsHistoryStore,
                private readonly balance: BalanceStore,
                private readonly userProfile: UserProfileStore,
                private readonly authorization: AuthorizationStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    createUserInteraction = (type: UserInteractionType): void => {
        if (!this.userId) {
            return;
        }

        if (!this.currentUser) {
            return;
        }

        if (!this.currentUser.roles.includes(UserRole.ROLE_USER)) {
            return;
        }

        const userInteractionCost = this.userInteractionsCosts.getUserInteractionCost(type);

        if (!isDefined(userInteractionCost)) {
            return;
        }

        const balance = this.balance.balances.get(Currency.COIN);

        if (!isDefined(balance)) {
            return;
        }

        if (balance < userInteractionCost) {
            this.snackbarService.enqueueSnackbar(
                this.locale.getCurrentLanguageLabel("balance.insufficient"),
                "error"
            );
            return;
        }

        this.pending = true;
        this.error = undefined;
        const userId = this.userId;

        CREATE_USER_INTERACTION_FUNCTIONS[type](userId)
            .then(({data}) => {
                this.userInteractionsCount.setUserInteractionsCount(userId, data);
                this.userInteractionHistory.insertUserInteractionForCurrentUser(type);
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }
}