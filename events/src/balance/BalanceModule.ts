import {Module} from "@nestjs/common";
import {BalanceController} from "./BalanceController";
import {WebsocketModule} from "../websocket";

@Module({
    providers: [BalanceController],
    imports: [WebsocketModule]
})
export class BalanceModule {

}