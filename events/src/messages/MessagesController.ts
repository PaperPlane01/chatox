import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {ChatMessage} from "../common/types";
import {MessageDeleted} from "../websocket/types";

@Injectable()
export class MessagesController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_message_created-${process.env.SERVER_PORT}`,
        routingKey: "chat.message.created.#"
    })
    public async onMessageCreated(chatMessage: ChatMessage): Promise<void> {
        await this.websocketEventsPublisher.publishMessageCreated(chatMessage);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_message_updated-${process.env.SERVER_PORT}`,
        routingKey: "chat.message.updated.#"
    })
    public async onMessageUpdated(chatMessage: ChatMessage): Promise<void> {
        await this.websocketEventsPublisher.publishMessageUpdated(chatMessage);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_message_deleted-${process.env.SERVER_PORT}`,
        routingKey: "chat.message.deleted.#"
    })
    public async onMessageDeleted(messageDeleted: MessageDeleted): Promise<void> {
        await this.websocketEventsPublisher.publishMessageDeleted(messageDeleted);
    }
}
