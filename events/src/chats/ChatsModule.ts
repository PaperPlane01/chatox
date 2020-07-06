import {Module} from "@nestjs/common";
import {ChatsController} from "./ChatsController";
import {WebsocketModule} from "../websocket";

@Module({
    providers: [ChatsController],
    imports: [WebsocketModule]
})
export class ChatsModule {

}
