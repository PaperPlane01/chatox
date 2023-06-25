import {Global, Module} from "@nestjs/common";
import {RabbitMQModule} from "@golevelup/nestjs-rabbitmq";
import {config} from "../config/env.config";

@Global()
@Module({
    imports: [
        RabbitMQModule.forRoot(RabbitMQModule, {
            uri: `amqp://${config.RABBITMQ_USERNAME}:${config.RABBITMQ_PASSWORD}@${config.RABBITMQ_HOST}:${config.RABBITMQ_PORT}`
        })
    ],
    exports: [RabbitMQModule]
})
export class RabbitMQConfigModule {}
