import {Module} from "@nestjs/common";
import {EurekaModule} from "./eureka";
import {RabbitMQConfigModule} from "./rabbitmq";
import {WebsocketModule} from "./websocket";

@Module({
  imports: [
      EurekaModule,
      RabbitMQConfigModule,
      WebsocketModule
  ]
})
export class AppModule {}
