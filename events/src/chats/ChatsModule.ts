import {forwardRef, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {PrivateChat, PrivateChatSchema} from "./entities";
import {ChatsController} from "./ChatsController";
import {WebsocketModule} from "../websocket";
import {ChatParticipationModule} from "../chat-participation";
import {ChatsService} from "./ChatsService";

@Module({
    providers: [ChatsController, ChatsService],
    imports: [
        MongooseModule.forFeature([
            {
                name: PrivateChat.name,
                schema: PrivateChatSchema
            }
        ]),
        forwardRef(() => WebsocketModule),
        ChatParticipationModule
    ],
    exports: [ChatsService]
})
export class ChatsModule {

}
