import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ReportsModule} from "./reports/reports.module";
import {MessagesModule} from "./messages/messages.module";
import {EurekaModule} from "./eureka/eureka.module";
import {OauthModule} from "./oauth/oauth.module";
import {AxiosModule} from "./axios/axios.module";
import {AuthModule} from "./auth/auth.module";
import {config} from "./config/env.config";
import {UsersModule} from "./users/users.module";
import {ChatsService} from "./chats/chats.service";
import {ChatsModule} from "./chats/chats.module";
import {RabbitMQConfigModule} from "./rabbitmq/rabbitmq-config.module";
import {UploadsModule} from "./uploads/uploads.module";

@Module({
    imports: [
        ReportsModule,
        MessagesModule,
        EurekaModule,
        OauthModule,
        AxiosModule,
        AuthModule,
        MongooseModule.forRoot(`mongodb://${config.MONGODB_HOST}:${config.MONGODB_PORT}/${config.REPORTS_SERVICE_DATABASE_NAME}`),
        UsersModule,
        ChatsModule,
        RabbitMQConfigModule,
        UploadsModule
    ],
    providers: [ChatsService]
})
export class AppModule {}
