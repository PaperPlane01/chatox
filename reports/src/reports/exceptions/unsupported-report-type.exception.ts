import {HttpException, HttpStatus} from "@nestjs/common";

export class UnsupportedReportTypeException extends HttpException {
    constructor(reportType: string) {
        super(`Report type ${reportType} is not supported`, HttpStatus.NOT_IMPLEMENTED);
    }
}
