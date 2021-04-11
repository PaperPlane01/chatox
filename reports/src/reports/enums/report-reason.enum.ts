import {BadRequestException} from "@nestjs/common";

export enum ReportReason {
    SPAM = "SPAM",
    ADULT_CONTENT = "PORNOGRAPHY",
    CHILD_ABUSE = "CHILD_ABUSE",
    FRAUD = "FRAUD",
    MISLEADING_INFORMATION = "MISLEADING_INFORMATION",
    VIOLENCE = "VIOLENCE",
    HATE_SPEECH = "HATE_SPEECH",
    OTHER = "OTHER"
}

export const parseReportReason = (reportReason?: string): ReportReason | undefined => {
    if (reportReason) {
        if (ReportReason[reportReason]) {
            return ReportReason[reportReason];
        } else {
            throw new BadRequestException(`Invalid report reason ${reportReason}`);
        }
    }

    return undefined;
}
