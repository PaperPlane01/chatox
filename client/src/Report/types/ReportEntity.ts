import {ReportReason, ReportStatus, ReportType} from "../../api/types/response";

export interface ReportEntity {
    id: string,
    type: ReportType,
    reason: ReportReason,
    status: ReportStatus,
    reportedObjectId: string,
    createdAt: Date,
    submittedById?: string,
    submittedByIdAddress: string,
    takenActions: string[],
    description?: string
}
