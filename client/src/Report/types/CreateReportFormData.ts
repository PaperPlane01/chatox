import {ReportReason} from "../../api/types/response";

export interface CreateReportFormData {
    reason: ReportReason,
    description: string
}
