import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {
	ChatNotificationsSettingsDeleted,
	ChatNotificationsSettingsUpdated,
	GlobalNotificationsSettingsUpdated
} from "./types";
import {WebsocketEventsPublisher} from "../websocket";
import {config} from "../env-config";

@Injectable()
export class NotificationsSettingsController {
	constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {
	}

	@RabbitSubscribe({
		exchange: "notification.events",
		routingKey: "notification.settings.chat.updated.#",
		queue: `events_service_chat_notifications_settings_updated-${config.EVENTS_SERVICE_PORT}`
	})
	public async onChatNotificationsSettingsUpdated(chatNotificationsSettingsUpdated: ChatNotificationsSettingsUpdated): Promise<void> {
		await this.websocketEventsPublisher.publishChatNotificationsSettingsUpdated(chatNotificationsSettingsUpdated);
	}

	@RabbitSubscribe({
		exchange: "notification.events",
		routingKey: "notification.settings.chat.deleted.#",
		queue: `events_service_chat_notifications_settings_deleted-${config.EVENTS_SERVICE_PORT}`
	})
	public async onChatNotificationsSettingsDeleted(chatNotificationsSettingsDeleted: ChatNotificationsSettingsDeleted): Promise<void> {
		await this.websocketEventsPublisher.publishChatNotificationsSettingsDeleted(chatNotificationsSettingsDeleted);
	}

	@RabbitSubscribe({
		exchange: "notification.events",
		routingKey: "notification.settings.global.updated.#",
		queue: `events_service_global_notifications_settings_updated-${config.EVENTS_SERVICE_PORT}`
	})
	public async onGlobalNotificationsSettingsUpdated(globalNotificationsSettingsUpdated: GlobalNotificationsSettingsUpdated): Promise<void> {
		await this.websocketEventsPublisher.publishGlobalNotificationsSettingsUpdated(globalNotificationsSettingsUpdated);
	}
}
