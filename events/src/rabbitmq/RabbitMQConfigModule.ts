import {Module} from "@nestjs/common";
import {RabbitMQModule} from "@nestjs-plus/rabbitmq";

@Module({
    imports: [
        RabbitMQModule.forRoot({
            uri: `amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
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
