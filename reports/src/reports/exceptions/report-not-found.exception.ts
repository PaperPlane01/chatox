import {HttpException, HttpStatus} from "@nestjs/common";

export class ReportNotFoundException extends HttpException {
    constructor(reportId: string) {
        super(`Could not find report with id ${reportId}`, HttpStatus.NOT_FOUND);
    }
}
