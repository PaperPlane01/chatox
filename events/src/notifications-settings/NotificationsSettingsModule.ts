import {Module} from "@nestjs/common";
import {NotificationsSettingsController} from "./NotificationsSettingsController";
import {WebsocketModule} from "../websocket";

@Module({
	providers: [NotificationsSettingsController],
	imports: [WebsocketModule]
})
export class NotificationsSettingsModule {

}
