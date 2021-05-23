import {ReportType} from "./ReportType";
import {ReportReason} from "./ReportReason";
import {ReportStatus} from "./ReportStatus";
import {ReportTakenAction} from "./ReportTakenAction";

export interface Report<ReportedObject> {
    id: string;
    type: ReportType,
    reason: ReportReason
    description?: string,
    reportedObject: ReportedObject,
    submittedById?: string,
    submittedByIpAddress: string,
    takenActions: ReportTakenAction[],
    createdAt: string,
    status: ReportStatus
}
