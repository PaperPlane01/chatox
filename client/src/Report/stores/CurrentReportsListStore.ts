import {makeAutoObservable} from "mobx";
import type {ReportsListStore} from "./ReportsListStore";

export class CurrentReportsListStore {
    currentReportsList: ReportsListStore;

    constructor() {
       makeAutoObservable(this);
    }

    setCurrentReportsList = (currentReportsList: ReportsListStore): void => {
        this.currentReportsList = currentReportsList;
    };
}
