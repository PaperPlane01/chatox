import {action, computed, observable} from "mobx";
import {UpdateSelectedReportsStore} from "./UpdateSelectedReportsStore";
import {ApiError} from "../../api";
import {ReportStatus} from "../../api/types/response";

export class DeclineSelectedReportsStore {
    @observable
    showSnackbar: boolean = false;

    @computed
    get pending(): boolean {
        return this.updateSelectedReportsStore.pending;
    }

    @computed
    get error(): ApiError | undefined {
        return this.updateSelectedReportsStore.error;
    }

    constructor(private readonly updateSelectedReportsStore: UpdateSelectedReportsStore) {
    }

    @action
    declineSelectedReports = (): void => {
        this.updateSelectedReportsStore.updateSelectedReports(
            [],
            ReportStatus.DECLINED,
            () => this.setShowSnackbar(true)
        );
    }

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    }
}
