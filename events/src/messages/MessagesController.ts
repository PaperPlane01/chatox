import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {ChatMessage} from "../common/types";
import {MessageDeleted} from "../websocket/types";
import {MessagesDeleted} from "../websocket/types/MessagesDeleted";

@Injectable()
export class MessagesController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.message.created.#",
        queue: `events_service_message_created-${process.env.SERVER_PORT}`
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

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_messages_deleted-${process.env.SERVER_PORT}`,
        routingKey: "chat.messages.deleted.#"
    })
    public async onMessagesDeleted(messagesDeleted: MessagesDeleted): Promise<void> {
        console.log("Messages deleted event");
        console.log(messagesDeleted);
        await this.websocketEventsPublisher.publishMessagesDeleted(messagesDeleted);
    }
}
