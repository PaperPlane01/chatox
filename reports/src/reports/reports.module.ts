import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ReportsService} from "./reports.service";
import {ReportsController} from "./reports.controller";
import {Report, ReportSchema} from "./entities/report.entity";
import {MessagesModule} from "../messages/messages.module";

@Module({
    providers: [ReportsService],
    controllers: [ReportsController],
    imports: [
        MongooseModule.forFeature([{name: Report.name, schema: ReportSchema}]),
        MessagesModule
    ]
})
export class ReportsModule {}
