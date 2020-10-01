import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {ChatBlocking} from "../common/types";
import {config} from "../env-config";

@Injectable()
export class ChatBlockingsController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_chat_blocking_created-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.blocking.created.#"
    })
    public async onChatBlockingCreated(chatBlocking: ChatBlocking): Promise<void> {
        await this.websocketEventsPublisher.publishChatBlockingCreated(chatBlocking);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_chat_blocking_updated-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.blocking.updated.#"
    })
    public async onChatBlockingUpdated(chatBlocking: ChatBlocking): Promise<void> {
        await this.websocketEventsPublisher.publishChatBlockingUpdated(chatBlocking);
    }
}
