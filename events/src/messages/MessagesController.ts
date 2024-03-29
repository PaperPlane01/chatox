import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {ChatMessage} from "../common/types";
import {MessageDeleted, MessageRead, MessagesDeleted} from "../websocket/types";
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

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_scheduled_message_created-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.scheduled.message.created.#"
    })
    public async onScheduledMessageCreated(message: ChatMessage): Promise<void> {
        this.log.debug("Scheduled message created event");
        this.log.debug(message);
        await this.websocketEventsPublisher.publishScheduledMessageCreated(message);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_scheduled_message_published-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.scheduled.message.published.#"
    })
    public async onScheduledMessagePublished(message: ChatMessage): Promise<void> {
        this.log.debug("Scheduled message published event");
        this.log.verbose(message);
        await this.websocketEventsPublisher.publishScheduledMessagePublished(message);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_scheduled_message_deleted-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.scheduled.message.deleted.#"
    })
    public async onScheduledMessageDeleted(messageDeleted: MessageDeleted): Promise<void> {
        this.log.debug("Scheduled message deleted event");
        this.log.verbose(messageDeleted);
        await this.websocketEventsPublisher.publishScheduledMessageDeleted(messageDeleted);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_scheduled_message_updated-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.scheduled.message.updated.#"
    })
    public async onScheduledMessageUpdated(message: ChatMessage): Promise<void> {
        this.log.debug("Scheduled message updated event");
        this.log.verbose(message);
        await this.websocketEventsPublisher.publishScheduledMessageUpdated(message);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: `events_service_message_read-${config.EVENTS_SERVICE_PORT}`,
        routingKey: "chat.message.read.#"
    })
    public async onMessageRead(messageRead: MessageRead): Promise<void> {
        this.log.debug("Message read event");
        this.log.verbose(messageRead);
        await this.websocketEventsPublisher.publishMessageRead(messageRead);
    }
}
