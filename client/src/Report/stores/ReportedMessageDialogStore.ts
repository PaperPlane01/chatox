import {action, observable} from "mobx";

export class ReportedMessageDialogStore {
    @observable
    reportId?: string = undefined;

    @action
    setReportId = (reportId?: string): void => {
        this.reportId = reportId;
    }
}
