import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {ChatRole} from "./types";
import {WebsocketEventsPublisher} from "../websocket";
import {config} from "../env-config";

@Injectable()
export class ChatRolesController {
    constructor(private readonly websocketEventsPublisher: WebsocketEventsPublisher) {
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.role.created.#",
        queue: `events_service_chat_role_created_${config.EVENTS_SERVICE_PORT}`
    })
    public async onChatRoleCreated(chatRole: ChatRole): Promise<void> {
        await this.websocketEventsPublisher.publishChatRoleCreated(chatRole);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.role.created.#",
        queue: `events_service_chat_role_updated_${config.EVENTS_SERVICE_PORT}`
    })
    public async onChatRoleUpdated(chatRole: ChatRole): Promise<void> {
        await this.websocketEventsPublisher.publishChatRoleUpdated(chatRole);
    }
}