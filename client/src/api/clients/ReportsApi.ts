import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {CreateReportRequest, FilterReportsRequest} from "../types/request";
import {Report} from "../types/response";
import {axiosInstance} from "../axios-instance";
import {REPORTS} from "../endpoints";

export class ReportsApi {
    public static createReport(createReportRequest: CreateReportRequest): AxiosPromise<void> {
        return axiosInstance.post(`/${REPORTS}`, createReportRequest);
    }

    public static findReports(filterReportsRequest: FilterReportsRequest): AxiosPromise<Array<Report<any>>> {
        const transformedRequest = {
            ...filterReportsRequest,
            reason: JSON.stringify(filterReportsRequest.reason),
            type: JSON.stringify(filterReportsRequest.type),
            status: JSON.stringify(filterReportsRequest.status)
        };
        return axiosInstance.get(`/${REPORTS}?${stringify(transformedRequest)}`);
    }
}
