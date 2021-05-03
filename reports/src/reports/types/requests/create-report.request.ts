import {IsIn, IsNotEmpty, IsOptional, IsString, MaxLength} from "class-validator";
import {ReportType} from "../../enums/report-type.enum";
import {ReportReason} from "../../enums/report-reason.enum";

export class CreateReportRequest {
    @IsNotEmpty()
    @IsString()
    reportedObjectId: string;
    
    @IsNotEmpty()
    @IsString()
    @IsIn([ReportType.USER, ReportType.CHAT, ReportType.MESSAGE])
    type: ReportType;
    
    @IsNotEmpty()
    @IsString()
    @IsIn([
        ReportReason.ADULT_CONTENT,
        ReportReason.CHILD_ABUSE,
        ReportReason.FRAUD,
        ReportReason.MISLEADING_INFORMATION,
        ReportReason.HATE_SPEECH,
        ReportReason.VIOLENCE,
        ReportReason.SPAM,
        ReportReason.OTHER
    ])
    reason: ReportReason;
    
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}
