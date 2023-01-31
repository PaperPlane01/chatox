import {makeAutoObservable} from "mobx";

export class ReportedMessageDialogStore {
    reportId?: string = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    setReportId = (reportId?: string): void => {
        this.reportId = reportId;
    };
}
