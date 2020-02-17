import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {EurekaModule} from "./eureka";
import {RabbitMQConfigModule} from "./rabbitmq";
import {WebsocketModule} from "./websocket";

@Module({
  imports: [
      EurekaModule,
      RabbitMQConfigModule,
      WebsocketModule,
      MongooseModule.forRoot(`mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE_NAME}`)
  ]
})
export class AppModule {}
