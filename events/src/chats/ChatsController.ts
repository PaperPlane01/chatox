import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {Chat} from "../common/types";
import {ChatDeleted} from "../common/types/events";
import {config} from "../env-config";

@Injectable()
export class ChatsController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.updated.#",
        queue: `events_service_chat_updated-${config.EVENTS_SERVICE_PORT}`
    })
    public async onChatUpdated(chat: Chat): Promise<void> {
        await this.websocketEventsPublisher.publishChatUpdated(chat);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.deleted.#",
        queue: `events_service_chat_deleted-${config.EVENTS_SERVICE_PORT}`
    })
    public async onChatDeleted(chatDeleted: ChatDeleted): Promise<void> {
        await this.websocketEventsPublisher.publishChatDeleted(chatDeleted);
    }
}
