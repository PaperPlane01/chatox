import {Module} from "@nestjs/common";
import {RabbitMQConfigModule} from "../rabbitmq";
import {WebsocketHandler} from "./WebsocketHandler";

@Module({
    providers: [WebsocketHandler],
    imports: [RabbitMQConfigModule]
})
export class WebsocketModule {}
