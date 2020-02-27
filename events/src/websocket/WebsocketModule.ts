import {forwardRef, Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {RabbitMQConfigModule} from "../rabbitmq";
import {WebsocketEventsPublisher} from "./WebsocketEventsPublisher";
import {ChatParticipationModule} from "../chat-participation";

@Module({
    providers: [WebsocketEventsPublisher],
    imports: [
        RabbitMQConfigModule,
        forwardRef(() => ChatParticipationModule),
        JwtModule.register({
            publicKey: process.env.JWT_PUBLIC_KEY
        })
    ],
    exports: [WebsocketEventsPublisher]
})
export class WebsocketModule {}
