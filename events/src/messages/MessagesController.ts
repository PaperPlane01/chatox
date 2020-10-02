import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {WebsocketEventsPublisher} from "../websocket";
import {ChatMessage} from "../common/types";
import {MessageDeleted} from "../websocket/types";
import {MessagesDeleted} from "../websocket/types/MessagesDeleted";
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
}
