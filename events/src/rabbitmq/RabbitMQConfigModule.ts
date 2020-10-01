import {Module} from "@nestjs/common";
import {RabbitMQModule} from "@nestjs-plus/rabbitmq";
import {config} from "../env-config";

@Module({
    imports: [
        RabbitMQModule.forRoot({
            uri: `amqp://${config.RABBITMQ_USERNAME}:${config.RABBITMQ_PASSWORD}@${config.RABBITMQ_HOST}:${config.RABBITMQ_PORT}`,
            exchanges: [
                {
                    name: "websocket.events",
                    type: "topic",
                }
            ],
        })
    ],
    exports: [RabbitMQModule]
})
export class RabbitMQConfigModule {}
