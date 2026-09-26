import {Module} from "@nestjs/common";
import {MessageReactionController} from "./MessageReactionsController";
import {WebsocketModule} from "../websocket";

@Module({
    providers: [MessageReactionController],
    imports: [WebsocketModule]
})
export class MessageReactionsModule {

}
