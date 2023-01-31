import {makeAutoObservable, observable, reaction, runInAction} from "mobx";
import {createTransformer} from "mobx-utils";
import {EntitiesStore} from "../../entities-store";
import {CurrentUser, ReportStatus, ReportType} from "../../api/types/response";
import {ApiError, getInitialApiErrorFromResponse, ReportsApi} from "../../api";
import {AuthorizationStore} from "../../Authorization/stores";

export class ReportsListStore {
    pending: boolean = false;

    currentPage: number = 0;

    error?: ApiError = undefined;

    awaitingForUser: boolean = false;

    selectedReportsMap = observable.map<string, boolean>({});

    showNotViewedOnly: boolean = window && window.localStorage
        ? window.localStorage.getItem("showNotViewedReportsOnly") === "true"
        : false;

    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    get ids(): string[] {
        return this.entities.reports.findIdsByType(this.type);
    }

    get selectedReportsIds(): string[] {
        const ids = [];

        for (let key of this.selectedReportsMap.keys()) {
            if (this.selectedReportsMap.get(key)) {
                ids.push(key);
            }
        }

        return ids;
    }

    get selectedReportedObjectsIds(): string[] {
        return this.entities.reports.findAllById(this.selectedReportsIds).map(report => report.reportedObjectId);
    }

    get numberOfSelectedReports(): number {
        return this.selectedReportsIds.length;
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly authorizationStore: AuthorizationStore,
                private readonly type: ReportType) {
        makeAutoObservable(this);

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

    setReportSelected = (reportId: string, selected: boolean): void => {
        this.selectedReportsMap.set(reportId, selected)
    };

    clearSelection = (): void => {
        this.selectedReportsMap.clear();
    };

    setShowNotViewedOnly = (showNotViewedOnly: boolean): void => {
        localStorage.setItem("showNotViewedReportsOnly", `${showNotViewedOnly}`);
        this.showNotViewedOnly = showNotViewedOnly;
    };

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
                    this.entities.reports.insertAll(data);
                    this.currentPage = this.currentPage + 1;
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    };

    reset = (): void => {
        this.currentPage = 0;
        this.error = undefined;
        this.entities.reports.deleteAll();
        this.cleanUpEntities();
        this.clearSelection();
    };

    private cleanUpEntities = (): void => {
        switch (this.type) {
            case ReportType.MESSAGE:
                this.entities.reportedMessages.deleteAll();
                this.entities.reportedMessageSenders.deleteAll();
                return;
            case ReportType.USER:
                this.entities.reportedUsers.deleteAll();
                return;
            case ReportType.CHAT:
                this.entities.reportedChats.deleteAll();
                return;
            default:
                return;
        }
    }
}
