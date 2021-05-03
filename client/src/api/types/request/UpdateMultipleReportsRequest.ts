import {UpdateReportRequest} from "./UpdateReportRequest";

export interface UpdateMultipleReportsRequest {
    updates: Array<UpdateReportRequest & {id: string}>
}
