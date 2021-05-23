import {BadRequestException} from "@nestjs/common";

export enum ReportStatus {
    NOT_VIEWED = "NOT_VIEWED",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED"
}

export const parseReportStatus = (reportStatus?: string): ReportStatus | undefined => {
    if (reportStatus) {
        if (ReportStatus[reportStatus]) {
            return ReportStatus[reportStatus];
        } else {
            throw new BadRequestException(`Invalid report status ${reportStatus}`);
        }
    }

    return undefined;
}
