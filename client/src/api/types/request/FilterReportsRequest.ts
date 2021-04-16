import {PaginationRequest} from "./PaginationRequest";
import {ReportReason, ReportStatus, ReportType} from "../response";

export interface FilterReportsRequest extends PaginationRequest {
    status: ReportStatus[],
    reason: ReportReason[],
    type: ReportType[]
}
