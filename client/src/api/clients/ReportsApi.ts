import {AxiosPromise} from "axios";
import {CreateReportRequest} from "../types/request";
import {axiosInstance} from "../axios-instance";
import {REPORTS} from "../endpoints";

export class ReportsApi {
    public static createReport(createReportRequest: CreateReportRequest): AxiosPromise<void> {
        return axiosInstance.post(`/${REPORTS}`, createReportRequest);
    }
}
