import {ReportStatus} from "../response";
import {ReportTakenAction} from "../response/ReportTakenAction";

export interface UpdateReportRequest {
    status: ReportStatus,
    takenActions: ReportTakenAction[]
}
