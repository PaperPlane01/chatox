import {Injectable, Logger} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {FilterQuery, Model} from "mongoose";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {UploadType} from "./enums";
import {UploadDeletedEvent} from "./types";
import {UploadsService} from "./uploads.service";
import {Report, ReportDocument} from "../reports/entities/report.entity";
import {ChatResponse} from "../chats/types/responses/chat.response";
import {ReportType} from "../reports/enums/report-type.enum";
import {MessageResponse} from "../messages/types/responses/message.response";
import {UserResponse} from "../users/types/responses/user.response";
import {forEachAsync} from "../utils/arrays";

const ARCHIVED = "archived";

@Injectable()
export class UploadEventsListener {
    private readonly log = new Logger(UploadEventsListener.name);

    constructor(@InjectModel(Report.name) private readonly reportModel: Model<ReportDocument<any>>,
                private readonly uploadsService: UploadsService) {
    }

    @RabbitSubscribe({
        exchange: "upload.events",
        routingKey: "upload.deleted.#",
        queue: "reports_service_upload_deleted"
    })
    public async onUploadDeleted(uploadDeleted: UploadDeletedEvent): Promise<void> {
        const chatReports = await this.findChatReportsWithUpload(uploadDeleted);
        const messageReports = await this.findMessageReportsWithUpload(uploadDeleted);
        const userReports = await this.findUserReportsWithUpload(uploadDeleted);

        let uploadArchived = false;

        if (chatReports.length !== 0) {
            await this.uploadsService.archiveUpload(uploadDeleted.uploadId);
            uploadArchived = true;
        }

        if (!uploadArchived && messageReports.length !== 0) {
            await this.uploadsService.archiveUpload(uploadDeleted.uploadId);
            uploadArchived = true;
        }

        if (!uploadArchived && userReports.length !== 0) {
            await this.uploadsService.archiveUpload(uploadDeleted.uploadId);
        }

        await forEachAsync(
            chatReports,
            async chatReport => await this.saveArchivedUrlForChat(chatReport)
        );
        await forEachAsync(
            messageReports,
            async messageReport => await this.savedArchivedUrlForMessage(messageReport, uploadDeleted.uploadId)
        );
        await forEachAsync(
            userReports,
            async userReport => await this.saveArchivedUploadForUser(userReport)
        );
    }

    private async findChatReportsWithUpload(uploadDeleted: UploadDeletedEvent): Promise<Array<ReportDocument<ChatResponse>>> {
        if (uploadDeleted.uploadType !== UploadType.IMAGE && uploadDeleted.uploadType !== UploadType.GIF) {
            return [];
        }

        const reportedObjectFilter: FilterQuery<ChatResponse> = {
            avatar: {
                id: uploadDeleted.uploadId,
                archivedAt: null
            }
        };

        return this.reportModel.find({
            type: ReportType.CHAT,
            reportedObject: reportedObjectFilter
        });
    }

    private findMessageReportsWithUpload(uploadDeleted: UploadDeletedEvent): Promise<Array<ReportDocument<MessageResponse>>> {
        const reportedObjectFilters: Array<FilterQuery<MessageResponse>> = [
            {
                attachments: {
                    id: uploadDeleted.uploadId,
                    archivedAt: null
                }
            },
            {
                "sender.avatar.id": uploadDeleted.uploadId,
                "sender.avatar.archivedAt": null
            }
        ];

        return this.reportModel.find({
            type: ReportType.MESSAGE,
            $or: reportedObjectFilters.map(filter => ({
                reportedObject: filter
            }))
        });
    }

    private async findUserReportsWithUpload(uploadDeleted: UploadDeletedEvent): Promise<Array<ReportDocument<UserResponse>>> {
        if (uploadDeleted.uploadType !== UploadType.IMAGE && uploadDeleted.uploadType !== UploadType.GIF) {
            return [];
        }

        const reportedObjectFilter: FilterQuery<UserResponse> = {
            avatar: {
                id: uploadDeleted.uploadId,
                archivedAt: null
            }
        };

        return this.reportModel.find({
            type: ReportType.USER,
            reportedObject: reportedObjectFilter
        });
    }

    private async saveArchivedUrlForChat(chatReport: ReportDocument<ChatResponse>): Promise<void> {
        if (!chatReport.reportedObject.avatar) {
            return;
        }

        this.log.log(`Setting upload URI to archived for chat report ${chatReport.id}`);
        chatReport.reportedObject.avatar.uri = chatReport.reportedObject.avatar.uri.replace(
            this.getReplacedString(chatReport.reportedObject.avatar.type),
            ARCHIVED
        );
        chatReport.reportedObject.avatar.archivedAt = new Date();
        await chatReport.save();
    }

    private async savedArchivedUrlForMessage(messageReport: ReportDocument<MessageResponse>, uploadId: string): Promise<void> {
        this.log.log(`Setting upload URI to archived for message report ${messageReport.id} and upload ${uploadId}`);
        messageReport.reportedObject.attachments = messageReport.reportedObject.attachments.map(attachment => {
            if (attachment.id !== uploadId) {
                return attachment;
            } else {
                return {
                    ...attachment,
                    uri: attachment.uri.replace(
                        this.getReplacedString(attachment.type),
                        ARCHIVED
                    ),
                    archived: true
                };
            }
        });

        if (messageReport.reportedObject.sender.avatar.id === uploadId) {
            messageReport.reportedObject.sender.avatar.uri = messageReport.reportedObject.sender.avatar.uri.replace(
                this.getReplacedString(messageReport.reportedObject.sender.avatar.type),
                ARCHIVED
            );
            messageReport.reportedObject.sender.avatar.archivedAt = new Date();
        }

        await messageReport.save();
    }

    private async saveArchivedUploadForUser(userReport: ReportDocument<UserResponse>): Promise<void> {
        if (!userReport.reportedObject.avatar) {
            return;
        }

        this.log.log(`Setting upload URI to archived for user report ${userReport.id}`);
        userReport.reportedObject.avatar.uri = userReport.reportedObject.avatar.uri.replace(
            this.getReplacedString(userReport.reportedObject.avatar.type),
            ARCHIVED
        );
        userReport.reportedObject.avatar.archivedAt = new Date();
        await userReport.save();
    }

    private getReplacedString(uploadType: UploadType): string {
        switch (uploadType) {
            case UploadType.IMAGE:
            case UploadType.GIF:
                return "images";
            case UploadType.AUDIO:
                return "audios";
            case UploadType.VIDEO:
                return "videos";
            case UploadType.FILE:
            default:
                return "files";
        }
    }
}
