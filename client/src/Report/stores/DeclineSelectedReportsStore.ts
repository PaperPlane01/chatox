import {makeAutoObservable} from "mobx";
import {UpdateSelectedReportsStore} from "./UpdateSelectedReportsStore";
import {ApiError} from "../../api";
import {ReportStatus} from "../../api/types/response";

export class DeclineSelectedReportsStore {
    showSnackbar: boolean = false;

    get pending(): boolean {
        return this.updateSelectedReportsStore.pending;
    }

    get error(): ApiError | undefined {
        return this.updateSelectedReportsStore.error;
    }

    constructor(private readonly updateSelectedReportsStore: UpdateSelectedReportsStore) {
        makeAutoObservable(this);
    }

    declineSelectedReports = (): void => {
        this.updateSelectedReportsStore.updateSelectedReports(
            [],
            ReportStatus.DECLINED,
            () => this.setShowSnackbar(true)
        );
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };
}
