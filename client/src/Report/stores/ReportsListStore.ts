import {action, computed, observable, reaction, runInAction} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";
import {CurrentUser, ReportStatus, ReportType} from "../../api/types/response";
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

    @observable
    selectedReportsMap = observable.map<string, boolean>({});

    @observable
    showNotViewedOnly: boolean = window && window.localStorage
        ? window.localStorage.getItem("showNotViewedReportsOnly") === "true"
        : false;

    @computed
    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    @computed
    get ids(): string[] {
        return this.entities.reports.findIdsByType(this.type);
    }

    @computed
    get selectedReportsIds(): string[] {
        const ids = [];

        for (let key of this.selectedReportsMap.keys()) {
            if (this.selectedReportsMap.get(key)) {
                ids.push(key);
            }
        }

        return ids;
    }

    @computed
    get selectedReportedObjectsIds(): string[] {
        return this.entities.reports.findAllById(this.selectedReportsIds).map(report => report.reportedObjectId);
    }

    @computed
    get numberOfSelectedReports(): number {
        return this.selectedReportsIds.length;
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
        );

        reaction(
            () => this.showNotViewedOnly,
            () => {
                this.reset();
                this.fetchReports();
            }
        );
    }

    isReportSelected = createTransformer((reportId: string) => {
        return Boolean(this.selectedReportsMap.get(reportId));
    });

    @action
    setReportSelected = (reportId: string, selected: boolean): void => {
        this.selectedReportsMap.set(reportId, selected)
    }

    @action
    clearSelection = (): void => {
        this.selectedReportsMap.clear();
    }

    @action
    setShowNotViewedOnly = (showNotViewedOnly: boolean): void => {
        localStorage.setItem("showNotViewedReportsOnly", `${showNotViewedOnly}`);
        this.showNotViewedOnly = showNotViewedOnly;
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
            status: this.showNotViewedOnly ? [ReportStatus.NOT_VIEWED] : [],
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
