import {IsArray, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";
import {parseReportStatus, ReportStatus} from "../../enums/report-status.enum";
import {PaginationRequest} from "../../../utils/pagination/types/requests";
import {parseReportType, ReportType} from "../../enums/report-type.enum";
import {transformToEnumArray} from "../../../utils/class-transformer";
import {ReportReason, parseReportReason} from "../../enums/report-reason.enum";

export class FilterReportsRequest extends PaginationRequest {
    @IsOptional()
    @IsArray()
    @IsString({each: true})
    @Transform(({value}) => transformToEnumArray(value, parseReportStatus))
    status: ReportStatus[] = [];

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    @Transform(({value}) => transformToEnumArray(value, parseReportType))
    type: ReportType[] = [];

    @IsOptional()
    @IsArray()
    @IsString({each: true})
    @Transform(({value}) => transformToEnumArray(value, parseReportReason))
    reason: ReportReason[] = [];
}
