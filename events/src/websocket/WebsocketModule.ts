import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {RabbitMQConfigModule} from "../rabbitmq";
import {WebsocketEventsPublisher} from "./WebsocketEventsPublisher";
import {ChatParticipationModule} from "../chat-participation";

@Module({
    providers: [WebsocketEventsPublisher],
    imports: [
        RabbitMQConfigModule,
        ChatParticipationModule,
        JwtModule.register({
            publicKey: process.env.JWT_PUBLIC_KEY
        })
    ]
})
export class WebsocketModule {}
