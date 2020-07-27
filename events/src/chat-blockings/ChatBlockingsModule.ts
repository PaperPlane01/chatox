import {Module} from "@nestjs/common";
import {ChatBlockingsController} from "./ChatBlockingsController";
import {WebsocketModule} from "../websocket";

@Module({
    providers: [ChatBlockingsController],
    imports: [WebsocketModule]
})
export class ChatBlockingsModule {}
