import {BadRequestException} from "@nestjs/common";

export enum ReportType {
    USER = "USER",
    MESSAGE = "MESSAGE",
    CHAT = "CHAT"
}

export const parseReportType = (reportType?: string): ReportType | undefined => {
    if (reportType) {
        if (ReportType[reportType]) {
            return ReportType[reportType];
        } else {
            throw new BadRequestException(`Invalid report type ${reportType}`);
        }
    }

    return undefined;
}
