import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {ChatRoleResponse} from "./types";
import {ChatRoleService} from "./ChatRoleService";
import {WebsocketEventsPublisher} from "../websocket";
import {config} from "../env-config";

@Injectable()
export class ChatRoleController {
    constructor(private readonly chatRoleService: ChatRoleService,
                @Inject(forwardRef(() => WebsocketEventsPublisher)) private readonly websocketEventsPublisher: WebsocketEventsPublisher) {
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.role.created.#",
        queue: `events_service_chat_role_created_${config.EVENTS_SERVICE_PORT}`
    })
    public async onChatRoleCreated(chatRole: ChatRoleResponse): Promise<void> {
        await this.chatRoleService.saveChatRole(chatRole);
        await this.websocketEventsPublisher.publishChatRoleCreated(chatRole);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.role.created.#",
        queue: `events_service_chat_role_updated_${config.EVENTS_SERVICE_PORT}`
    })
    public async onChatRoleUpdated(chatRole: ChatRoleResponse): Promise<void> {
        await this.chatRoleService.saveChatRole(chatRole);
        await this.websocketEventsPublisher.publishChatRoleUpdated(chatRole);
    }
}