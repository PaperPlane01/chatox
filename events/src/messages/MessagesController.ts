import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {ChatMessage} from "../common/types";
import {MessageDeleted, MessagesDeleted} from "../websocket/types";
import {config} from "../env-config";
import {LoggerFactory} from "../logging";

@Injectable()
export class MessagesController {
    private readonly log = LoggerFactory.getLogger(MessagesController);

    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.message.created.#",
        queue: `events_service_message_created-${config.EVENTS_SERVICE_PORT}`
    })
    public async onMessageCreated(chatMessage: ChatMessage): Promise<void> {
        await this.websocketEventsPublisher.publishMessageCreated(chatMessage);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_message_updated-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.message.updated.#"
    })
    public async onMessageUpdated(chatMessage: ChatMessage): Promise<void> {
        await this.websocketEventsPublisher.publishMessageUpdated(chatMessage);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_message_deleted-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.message.deleted.#"
    })
    public async onMessageDeleted(messageDeleted: MessageDeleted): Promise<void> {
        this.log.debug("Received messageDeleted event");
        this.log.consoleLog(messageDeleted, "debug");
        await this.websocketEventsPublisher.publishMessageDeleted(messageDeleted);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_messages_deleted-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.messages.deleted.#"
    })
    public async onMessagesDeleted(messagesDeleted: MessagesDeleted): Promise<void> {
        this.log.debug("Messages deleted event");
        this.log.debug(messagesDeleted);
        await this.websocketEventsPublisher.publishMessagesDeleted(messagesDeleted);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_message_pinned-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.message.pinned.#"
    })
    public async onMessagePinned(message: ChatMessage): Promise<void> {
        this.log.debug("Message pinned event");
        this.log.debug(message);
        await this.websocketEventsPublisher.publishMessagePinned(message);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_message_unpinned-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.message.unpinned.#"
    })
    public async onMessageUnpinned(message: ChatMessage): Promise<void> {
        this.log.debug("Message unpinned event");
        this.log.debug(message);
        await this.websocketEventsPublisher.publishMessageUnpinned(message);
    }
}
