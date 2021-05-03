import {ReportReason, ReportType} from "../response";

export interface CreateReportRequest {
    type: ReportType,
    reason: ReportReason,
    reportedObjectId: string,
    description?: string
}
