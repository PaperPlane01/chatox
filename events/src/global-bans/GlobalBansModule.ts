import {Module} from "@nestjs/common";
import {GlobalBansController} from "./GlobalBansController";
import {WebsocketModule} from "../websocket";

@Module({
    imports: [WebsocketModule],
    providers: [GlobalBansController]
})
export class GlobalBansModule {}
