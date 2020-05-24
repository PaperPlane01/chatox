import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {EurekaModule} from "./eureka";
import {RabbitMQConfigModule} from "./rabbitmq";
import {WebsocketModule} from "./websocket";
import {ChatParticipationModule} from "./chat-participation";
import {MessagesModule} from "./messages";
import {ChatBlockingsModule} from "./chat-blockings";

@Module({
  imports: [
      EurekaModule,
      RabbitMQConfigModule,
      WebsocketModule,
      ChatParticipationModule,
      MessagesModule,
      ChatBlockingsModule,
      MongooseModule.forRoot(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE_NAME}`)
  ]
})
export class AppModule {}
