import {UpdateReportWithIdRequest} from "./update-report-with-id.request";
import {ArrayMaxSize, IsArray, IsNotEmpty, ValidateNested} from "class-validator";

export class UpdateMultipleReportsRequest {
    @IsNotEmpty()
    @IsArray()
    @ArrayMaxSize(50)
    @ValidateNested()
    updates: UpdateReportWithIdRequest[]
}
