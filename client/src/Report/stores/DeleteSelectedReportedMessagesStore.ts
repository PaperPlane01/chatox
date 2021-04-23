import {action, computed, observable} from "mobx";
import {ReportsListStore} from "./ReportsListStore";
import {UpdateSelectedReportsStore} from "./UpdateSelectedReportsStore";
import {ApiError, getInitialApiErrorFromResponse, MessageApi} from "../../api";
import {ReportStatus, ReportTakenAction} from "../../api/types/response";

export class DeleteSelectedReportedMessagesStore {
    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @computed
    get selectedMessagesIds(): string[] {
        return this.reportsListStore.selectedReportedObjectsIds;
    }

    constructor(private readonly reportsListStore: ReportsListStore,
                private readonly updateSelectedReportsStore: UpdateSelectedReportsStore) {
    }

    @action
    deleteSelectedReportedMessages = (): void => {
        this.pending = true;
        this.error = undefined;

        MessageApi.deleteMultipleMessages({messagesIds: this.selectedMessagesIds})
            .then(() => this.updateSelectedReportsStore.updateSelectedReports(
                [ReportTakenAction.MESSAGE_DELETED],
                ReportStatus.ACCEPTED
            ))
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false);
    }
}
