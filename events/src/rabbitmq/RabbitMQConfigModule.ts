import {Module} from "@nestjs/common";
import {RabbitMQModule} from "@nestjs-plus/rabbitmq";

@Module({
    imports: [
        RabbitMQModule.forRoot({
            uri: `amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBIT_MQ_HOST}:${process.env.RABBIT_MQ_PORT}`,
            exchanges: [
                {
                    name: "websocket.events",
                    type: "topic"
                }
            ],
        })
    ],
    exports: [RabbitMQModule]
})
export class RabbitMQConfigModule {}
