import {Module} from "@nestjs/common";
import {MessagesController} from "./MessagesController";
import {WebsocketModule} from "../websocket";

@Module({
    providers: [MessagesController],
    imports: [WebsocketModule]
})
export class MessagesModule {}
