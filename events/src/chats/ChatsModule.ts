import {forwardRef, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {PrivateChatSchema} from "./schemas";
import {ChatsController} from "./ChatsController";
import {WebsocketModule} from "../websocket";
import {ChatParticipationModule} from "../chat-participation";
import {ChatsService} from "./ChatsService";

@Module({
    providers: [ChatsController, ChatsService],
    imports: [
        MongooseModule.forFeature([
            {
                name: "privateChat",
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
