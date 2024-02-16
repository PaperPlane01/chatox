import {Module} from "@nestjs/common";
import {UploadsService} from "./uploads.service";
import {UploadEventsListener} from "./upload-events.listener";
import {MongooseModule} from "@nestjs/mongoose";
import {Report, ReportSchema} from "../reports/entities/report.entity";
import {AxiosModule} from "../axios/axios.module";
import {EurekaModule} from "../eureka/eureka.module";

@Module({
    providers: [
        UploadsService,
        UploadEventsListener
    ],
    imports: [
        MongooseModule.forFeature([{name: Report.name, schema: ReportSchema}]),
        AxiosModule,
        EurekaModule
    ]
})
export class UploadsModule {

}
