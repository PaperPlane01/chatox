import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {EurekaModule} from "./eureka";
import {RabbitMQConfigModule} from "./rabbitmq";
import {WebsocketModule} from "./websocket";
import {ChatParticipationModule} from "./chat-participation";

@Module({
  imports: [
      EurekaModule,
      RabbitMQConfigModule,
      WebsocketModule,
      ChatParticipationModule,
      MongooseModule.forRoot(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE_NAME}`)
  ]
})
export class AppModule {}
