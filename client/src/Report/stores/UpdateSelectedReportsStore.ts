import {action, computed, observable, runInAction} from "mobx";
import {CurrentReportsListStore} from "./CurrentReportsListStore";
import {EntitiesStore} from "../../entities-store";
import {ApiError, getInitialApiErrorFromResponse, ReportsApi} from "../../api";
import {ReportStatus, ReportTakenAction} from "../../api/types/response";
import {UpdateReportRequest} from "../../api/types/request";

export class UpdateSelectedReportsStore {
    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get selectedReportsIds(): string[] {
        return this.currentReportsListStore.currentReportsList
            ? this.currentReportsListStore.currentReportsList.selectedReportsIds
            : [];
    }

    constructor(private readonly entities: EntitiesStore,
                private readonly currentReportsListStore: CurrentReportsListStore) {
    }

    @action
    updateSelectedReports = (takenActions: ReportTakenAction[], status: ReportStatus, successCallback?: () => void): void => {
        if (this.selectedReportsIds.length === 0) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const selectedReports = this.entities.reports.findAllById(this.selectedReportsIds);
        const updates: Array<UpdateReportRequest & {id: string}> = selectedReports.map(report => ({
            id: report.id,
            status,
            takenActions: Array.from(new Set([...takenActions, ...report.takenActions]))
        }));

        ReportsApi.updateMultipleReports({updates})
            .then(({data}) => {
                this.entities.reports.insertAll(data);

                if (successCallback) {
                    successCallback();
                }
            })
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }
}
