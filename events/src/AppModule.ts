import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {EurekaModule} from "./eureka";
import {RabbitMQConfigModule} from "./rabbitmq";
import {WebsocketModule} from "./websocket";
import {ChatParticipationModule} from "./chat-participation";
import {MessagesModule} from "./messages";
import {ChatBlockingsModule} from "./chat-blockings";
import {ChatsModule} from "./chats";
import {GlobalBansModule} from "./global-bans";
import {ChatRoleModule} from "./chat-roles";
import {config} from "./env-config";
import {BalanceModule} from "./balance";

@Module({
  imports: [
      EurekaModule,
      RabbitMQConfigModule,
      WebsocketModule,
      ChatParticipationModule,
      MessagesModule,
      ChatBlockingsModule,
      ChatsModule,
      GlobalBansModule,
      ChatRoleModule,
      BalanceModule,
      MongooseModule.forRoot(`mongodb://${config.MONGODB_HOST}:${config.MONGODB_PORT}/${config.EVENTS_SERVICE_DATABASE_NAME}`)
  ]
})
export class AppModule {}
