import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {RabbitMQConfigModule} from "../rabbitmq";
import {WebsocketHandler} from "./WebsocketHandler";
import {ChatParticipationModule} from "../chat";

@Module({
    providers: [WebsocketHandler],
    imports: [
        RabbitMQConfigModule,
        ChatParticipationModule,
        JwtModule.register({
            publicKey: process.env.JWT_PUBLIC_KEY
        })
    ]
})
export class WebsocketModule {}
