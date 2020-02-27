import {forwardRef, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ChatParticipationSchema} from "./schemas";
import {ChatParticipationController} from "./ChatParticipationController";
import {ChatParticipationService} from "./ChatParticipationService";
import {WebsocketModule} from "../websocket";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: "chatParticipation",
                schema: ChatParticipationSchema
            }
        ]),
        forwardRef(() => WebsocketModule)
    ],
    providers: [ChatParticipationController, ChatParticipationService],
    exports: [ChatParticipationService]
})
export class ChatParticipationModule {}
