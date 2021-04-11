import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Report, ReportDocument} from "./entities/report.entity";
import {Model, FilterQuery} from "mongoose";
import {MessagesService} from "../messages/messages.service";
import {CreateReportRequest} from "./types/requests/create-report.request";
import {ReportResponse} from "./types/responses/report.response";
import {ReportType} from "./enums/report-type.enum";
import {ReportStatus} from "./enums/report-status.enum";
import {MessageNotFoundException} from "../messages/exceptions/message-not-found.exception";
import {MessageResponse} from "../messages/types/responses/message.response";
import {User} from "../auth/types/user";
import {PaginationRequest} from "../utils/pagination/types/requests";
import {calculateOffset} from "../utils/pagination";
import {FilterReportsRequest} from "./types/requests/filter-reports.request";

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
            .skip(calculateOffset(filters.page, filters.pageSize))
            .limit(filters.pageSize)
            .exec();

        return reports.map(report => this.mapToReportResponse(report));
    }

    public async findMessagesReports(paginationRequest: PaginationRequest, notViewedOnly: boolean): Promise<Array<ReportResponse<MessageResponse>>> {
        let reports: Array<ReportDocument<any>>;

        if (notViewedOnly) {
            reports = await this.reportsModel.find({
                status: ReportStatus.NOT_VIEWED,
                type: ReportType.MESSAGE
            })
                .skip(calculateOffset(paginationRequest.page, paginationRequest.pageSize))
                .limit(paginationRequest.pageSize)
                .exec();
        } else {
            reports = await this.reportsModel.find({
                type: ReportType.MESSAGE
            })
                .skip(calculateOffset(paginationRequest.page, paginationRequest.pageSize))
                .limit(paginationRequest.pageSize)
                .exec();
        }

        return reports.map(report => this.mapToReportResponse(report as ReportDocument<MessageResponse>));
    }
    
    private mapToReportResponse<ReportedObject>(report: Report<ReportedObject>): ReportResponse<ReportedObject> {
        return new ReportResponse({
            id: report._id.toHexString(),
            createdAt: report.createdAt.toISOString(),
            description: report.description,
            reason: report.reason,
            reportedObject: report.reportedObject,
            status: report.status,
            submittedById: report.submittedById,
            submittedByIpAddress: report.submittedByIpAddress,
            takenActions: report.takenActions,
            type: report.type
        });
    }
}
