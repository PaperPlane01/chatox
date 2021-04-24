import {observable, action, computed} from "mobx";
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
                this.entities.insertReports(data);

                if (successCallback) {
                    successCallback();
                }
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }
}
