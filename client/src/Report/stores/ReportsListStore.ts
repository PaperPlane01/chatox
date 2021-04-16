import {action, computed, observable, reaction, runInAction} from "mobx";
import {EntitiesStore} from "../../entities-store";
import {CurrentUser, ReportType} from "../../api/types/response";
import {ApiError, getInitialApiErrorFromResponse, ReportsApi} from "../../api";
import {AuthorizationStore} from "../../Authorization/stores";

export class ReportsListStore {
    @observable
    pending: boolean = false;

    @observable
    currentPage: number = 0;

    @observable
    error?: ApiError = undefined;

    @observable
    awaitingForUser: boolean = false;

    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    @computed
    get ids(): string[] {
        return this.entities.reports.findIdsByType(this.type);
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorizationStore: AuthorizationStore,
                private readonly type: ReportType) {
        reaction(
            () => this.currentUser,
            currentUser => {
                if (currentUser && this.awaitingForUser) {
                    this.fetchReports();
                }
            }
        )
    }

    @action
    fetchReports = (): void => {
        if (!this.currentUser) {
            this.awaitingForUser = true;
            return;
        } else {
            this.awaitingForUser = false;
        }

        this.pending = true;
        this.error = undefined;

        ReportsApi.findReports({
            type: [this.type],
            status: [],
            reason: [],
            page: this.currentPage
        })
            .then(({data}) => runInAction(() => {
                if (data.length !== 0) {
                    this.entities.insertReports(data);
                    this.currentPage = this.currentPage + 1;
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    @action
    reset = (): void => {
        this.currentPage = 0;
        this.error = undefined;

        this.entities.deleteAllReports(this.type);
    }
}
