import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import {ReportType} from "../enums/report-type.enum";
import {ReportReason} from "../enums/report-reason.enum";
import {ReportStatus} from "../enums/report-status.enum";
import {ReportActionTaken} from "../enums/report-action-taken.enum";
import {PartialBy} from "../../utils/types";

export type ReportDocument<ReportedObject> = Report<ReportedObject> & mongoose.Document;

@Schema()
export class Report<ReportedObject> {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id = new mongoose.Types.ObjectId()

    @Prop()
    createdAt: Date = new Date();

    @Prop()
    submittedById?: string

    @Prop()
    submittedByIpAddress: string;

    @Prop({
        enum: [
            ReportType.CHAT,
            ReportType.MESSAGE,
            ReportType.USER
        ]
    })
    type: ReportType;
    
    @Prop({
        enum: [
            ReportReason.ADULT_CONTENT,
            ReportReason.CHILD_ABUSE,
            ReportReason.FRAUD,
            ReportReason.HATE_SPEECH,
            ReportReason.MISLEADING_INFORMATION,
            ReportReason.SPAM,
            ReportReason.VIOLENCE,
            ReportReason.OTHER
        ]
    })
    reason: ReportReason;

    @Prop({
        enum: [
            ReportStatus.NOT_VIEWED,
            ReportStatus.ACCEPTED,
            ReportStatus.DECLINED
        ]
    })
    status: ReportStatus = ReportStatus.NOT_VIEWED;

    @Prop()
    takenActions: ReportActionTaken[] = [];
    
    @Prop()
    description: string;

    @Prop({type: mongoose.Schema.Types.Mixed})
    reportedObject: ReportedObject;

    constructor(report?: PartialBy<Report<ReportedObject>, "_id" | "takenActions" | "status" | "createdAt">) {
        if (report) {
            Object.assign(this, report);
        }
    }
}

export const ReportSchema = SchemaFactory.createForClass(Report);
