import {forwardRef, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ChatRoleController} from "./ChatRoleController";
import {ChatRole, ChatRoleSchema} from "./entities";
import {WebsocketModule} from "../websocket";
import {ChatRoleService} from "./ChatRoleService";

@Module({
    providers: [ChatRoleController, ChatRoleService],
    imports: [
        forwardRef(() => WebsocketModule),
        MongooseModule.forFeature([
            {
                name: ChatRole.name,
                schema: ChatRoleSchema
            }
        ]),
    ],
    exports: [ChatRoleService]
})
export class ChatRoleModule {

}