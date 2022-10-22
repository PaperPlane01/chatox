import {forwardRef, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ChatParticipation, ChatParticipationSchema} from "./entities";
import {ChatParticipationController} from "./ChatParticipationController";
import {ChatParticipationService} from "./ChatParticipationService";
import {WebsocketModule} from "../websocket";
import {ChatRoleModule} from "../chat-roles";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ChatParticipation.name,
                schema: ChatParticipationSchema
            }
        ]),
        forwardRef(() => WebsocketModule),
        ChatRoleModule
    ],
    providers: [ChatParticipationController, ChatParticipationService],
    exports: [ChatParticipationService]
})
export class ChatParticipationModule {}
