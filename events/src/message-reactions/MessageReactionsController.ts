import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@golevelup/nestjs-rabbitmq";
import {MessageReactionAdded, MessageReactionDeleted} from "./types/events";
import {WebsocketEventsPublisher} from "../websocket";
import {config} from "../env-config";

@Injectable()
export class MessageReactionController {

    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.message.reaction.added.#",
        queue: `events_service_message_reaction_added_${config.EVENTS_SERVICE_PORT}`
    })
    public async onMessageReactionAdded(messageReactionAdded: MessageReactionAdded): Promise<void> {
        await this.websocketEventsPublisher.publishMessageReactionAdded(messageReactionAdded);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.message.reaction.deleted.#",
        queue: `events_service_message_reaction_deleted_${config.EVENTS_SERVICE_PORT}`
    })
    public async onMessageReactionDeleted(messageReactionDeleted: MessageReactionDeleted): Promise<void> {
        await this.websocketEventsPublisher.publishMessageReactionDeleted(messageReactionDeleted);
    }
}
