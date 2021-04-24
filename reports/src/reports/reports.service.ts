import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Report, ReportDocument} from "./entities/report.entity";
import {FilterQuery, Model} from "mongoose";
import {MessagesService} from "../messages/messages.service";
import {CreateReportRequest} from "./types/requests/create-report.request";
import {ReportResponse} from "./types/responses/report.response";
import {ReportType} from "./enums/report-type.enum";
import {MessageNotFoundException} from "../messages/exceptions/message-not-found.exception";
import {MessageResponse} from "../messages/types/responses/message.response";
import {User} from "../auth/types/user";
import {calculateOffset} from "../utils/pagination";
import {FilterReportsRequest} from "./types/requests/filter-reports.request";
import {UpdateReportRequest} from "./types/requests/update-report.request";
import {ReportNotFoundException} from "../exceptions/report-not-found.exception";
import {UpdateMultipleReportsRequest} from "./types/requests/update-multiple-reports.request";
import {UserResponse} from "../users/types/responses/user.response";
import {config} from "../config/env.config";
import {UploadResponse} from "../common/types";

@Injectable()
export class ReportsService {
    private readonly log = new Logger(ReportsService.name);
    
    constructor(@InjectModel(Report.name) private readonly reportsModel: Model<ReportDocument<any>>,
                private readonly messagesService: MessagesService) {
    }

    public async createReport(createReportRequest: CreateReportRequest, ipAddress: string, user?: User): Promise<void> {
        if (createReportRequest.type !== ReportType.MESSAGE) {
            throw new HttpException(`Report type ${createReportRequest.type} is not yet supported`, HttpStatus.NOT_IMPLEMENTED);
        }
        
        try {
            const message = await this.messagesService.findMessageById(createReportRequest.reportedObjectId);
            
            const report = new Report<MessageResponse>({
                description: createReportRequest.description,
                reason: createReportRequest.reason,
                reportedObject: message,
                submittedByIpAddress: ipAddress,
                type: createReportRequest.type,
                submittedById: user ? user.id : undefined
            });
            
            await new this.reportsModel(report).save();
        } catch (error) {
            if (error instanceof MessageNotFoundException) {
                throw error;
            }
            
            this.log.error("Error occurred when tried to save report");
            this.log.error(error.trace ? error.trace : error);
            
            throw error;
        }
    }

    public async findReports(filters: FilterReportsRequest): Promise<Array<ReportResponse<any>>> {
        const filterQuery: FilterQuery<Report<any>> = {};

        if (filters.type.length !== 0) {
            filterQuery.type = {
                $in: filters.type
            };
        }

        if (filters.status.length !== 0) {
            filterQuery.status = {
                $in: filters.status
            };
        }

        if (filters.reason.length !== 0) {
            filterQuery.reason = {
                $in: filters.reason
            };
        }

        const reports = await this.reportsModel
            .find(filterQuery)
            .sort({createdAt: "desc"})
            .skip(calculateOffset(filters.page, filters.pageSize))
            .limit(filters.pageSize)
            .exec();

        return reports.map(report => this.mapToReportResponse(report));
    }

    public async updateReport(id: string, updateReportRequest: UpdateReportRequest): Promise<ReportResponse<any>> {
        const report = await this.reportsModel.findOne({id});

        if (!report) {
            throw new ReportNotFoundException(id);
        }

        report.status = updateReportRequest.status;
        report.takenActions = updateReportRequest.takenActions;

        await report.save();

        return this.mapToReportResponse(report);
    }

    public async updateMultipleReports(updateMultipleReportsRequest: UpdateMultipleReportsRequest): Promise<Array<ReportResponse<any>>> {
        const ids = updateMultipleReportsRequest.updates.map(update => update.id);
        const reports = await this.reportsModel.find({
            _id: {
                $in: ids
            }
        })
            .exec();

        for (let report of reports) {
            const updates = updateMultipleReportsRequest.updates.find(update => update.id === report._id.toHexString());

            if (updates) {
                report.takenActions = updates.takenActions;
                report.status = updates.status;

                await report.save();
            }
        }

        return reports.map(report => this.mapToReportResponse(report));
    }
    
    private mapToReportResponse<ReportedObject>(report: Report<ReportedObject>): ReportResponse<ReportedObject> {
        return new ReportResponse({
            id: report._id.toHexString(),
            createdAt: report.createdAt.toISOString(),
            description: report.description,
            reason: report.reason,
            reportedObject: this.fixReportedObjectUrls(report.type, report.reportedObject),
            status: report.status,
            submittedById: report.submittedById,
            submittedByIpAddress: report.submittedByIpAddress,
            takenActions: report.takenActions,
            type: report.type
        });
    }

    private fixReportedObjectUrls<ReportedObject>(reportType: ReportType, reportedObject: ReportedObject): ReportedObject {
        switch (reportType) {
            case ReportType.MESSAGE:
                return this.fixMessageUploadsUris(reportedObject as unknown as MessageResponse) as unknown as ReportedObject;
            case ReportType.USER:
                return this.fixUserAvatarUri(reportedObject as unknown as UserResponse) as unknown as ReportedObject;
            default:
                return reportedObject;
        }
    }

    private fixUserAvatarUri(user: UserResponse): UserResponse {
        if (!user.avatar) {
            return user;
        }

        return {
            ...user,
            avatar: this.fixUploadUri(user.avatar)
        };
    }

    private fixMessageUploadsUris(message: MessageResponse): MessageResponse {
        if (!message.sender.avatar && message.attachments.length === 0) {
            return message;
        }

        let attachments = message.attachments;
        let sender = message.sender;

        if (attachments.length !== 0) {
            attachments = attachments.map(attachment => this.fixUploadUri(attachment));
        }

        if (message.sender.avatar) {
            sender = this.fixUserAvatarUri(message.sender);
        }

        return {
            ...message,
            attachments,
            sender
        };
    }

    private fixUploadUri(upload: UploadResponse): UploadResponse {
        const uri = new URL(upload.uri);
        uri.host = config.API_HOST;

        return {...upload, uri: uri.href};
    }
}
