import {Module} from "@nestjs/common";
import {ChatRolesController} from "./ChatRolesController";
import {WebsocketModule} from "../websocket";

@Module({
    providers: [ChatRolesController],
    imports: [WebsocketModule]
})
export class ChatRolesModule {

}