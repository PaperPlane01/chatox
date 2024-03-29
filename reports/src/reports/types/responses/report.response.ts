import {ReportType} from "../../enums/report-type.enum";
import {ReportReason} from "../../enums/report-reason.enum";
import {ReportStatus} from "../../enums/report-status.enum";
import {ReportActionTaken} from "../../enums/report-action-taken.enum";

export class ReportResponse<T> {
    id: string;
    createdAt: string;
    submittedById?: string;
    submittedByIpAddress: string;
    type: ReportType;
    reason: ReportReason;
    status: ReportStatus;
    takenActions: ReportActionTaken[] = [];
    description: string;
    reportedObject: T;

    constructor(reportResponse: ReportResponse<T>) {
        Object.assign(this, reportResponse);
    }
}
