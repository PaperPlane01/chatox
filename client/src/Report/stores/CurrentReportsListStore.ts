import {action, observable} from "mobx";
import {ReportsListStore} from "./ReportsListStore";

export class CurrentReportsListStore {
    @observable
    currentReportsList: ReportsListStore;

    @action
    setCurrentReportsList = (currentReportsList: ReportsListStore): void => {
        this.currentReportsList = currentReportsList;
    }
}
