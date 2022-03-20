import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {ChatsService} from "./ChatsService";
import {WebsocketEventsPublisher} from "../websocket";
import {Chat} from "../common/types";
import {ChatDeleted, PrivateChatCreated} from "../common/types/events";
import {config} from "../env-config";

@Injectable()
export class ChatsController {
    constructor(@Inject(forwardRef(() => WebsocketEventsPublisher)) private readonly websocketEventsPublisher: WebsocketEventsPublisher,
                private readonly chatsService: ChatsService) {}

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

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.private.created.#",
        queue: `events_service_private_chat_created-${config.EVENTS_SERVICE_PORT}`
    })
    public async onPrivateChatCreated(privateChatCreated: PrivateChatCreated): Promise<void> {
        console.log(privateChatCreated);
        await this.chatsService.savePrivateChat(privateChatCreated);
        await this.websocketEventsPublisher.publishPrivateChatCreated(privateChatCreated);
    }
}
