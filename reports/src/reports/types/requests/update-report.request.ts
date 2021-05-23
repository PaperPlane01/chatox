import {ReportStatus} from "../../enums/report-status.enum";
import {IsArray, IsIn, IsNotEmpty} from "class-validator";
import {ReportActionTaken} from "../../enums/report-action-taken.enum";

export class UpdateReportRequest {
    @IsNotEmpty()
    @IsIn([ReportStatus.NOT_VIEWED, ReportStatus.ACCEPTED, ReportStatus.DECLINED])
    status: ReportStatus;

    @IsArray()
    @IsIn(
        [
            ReportActionTaken.CHAT_DELETED,
            ReportActionTaken.MESSAGE_DELETED,
            ReportActionTaken.USER_BANNED
        ],
        {
            each: true
        }
    )
    takenActions: ReportActionTaken[];
}
