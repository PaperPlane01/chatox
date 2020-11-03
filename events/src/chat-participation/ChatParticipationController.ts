import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {ChatParticipationService} from "./ChatParticipationService";
import {ChatParticipationDto} from "./types";
import {WebsocketEventsPublisher} from "../websocket";
import {config} from "../env-config";
import {UserKickedFromChat, UserLeftChat} from "../common/types/events";

@Injectable()
export class ChatParticipationController {
    constructor(private readonly chatParticipationService: ChatParticipationService,
                @Inject(forwardRef(() => WebsocketEventsPublisher)) private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.user.joined.#",
        queue: `events_service_user_joined-${config.EVENTS_SERVICE_PORT}`
    })
    public async onUserJoinedChat(createChatParticipationDto: ChatParticipationDto): Promise<void> {
        await this.chatParticipationService.saveChatParticipation(createChatParticipationDto);
        await this.websocketEventsPublisher.publishUserJoinedChat(createChatParticipationDto);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.user.left.#",
        queue: `events_service_user_left-${config.EVENTS_SERVICE_PORT}`
    })
    public async onUserLeftChat(userLeftChat: UserLeftChat): Promise<void> {
        await this.chatParticipationService.deleteChatParticipation(userLeftChat.chatParticipationId);
        await this.websocketEventsPublisher.publishUserLeftChat(userLeftChat);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.participation.deleted.#",
        queue: `events_service_chat_participation_deleted-${config.EVENTS_SERVICE_PORT}`
    })
    public async onUserKickedFromChat(userKickedFromChat: UserKickedFromChat): Promise<void> {
        await this.chatParticipationService.deleteChatParticipation(userKickedFromChat.chatParticipationId);
        await this.websocketEventsPublisher.publishUserKickedFromChat(userKickedFromChat);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.participants.online.#",
        queue: `events_service_chat_participant_online-${config.EVENTS_SERVICE_PORT}`
    })
    public async onChatParticipantsWentOnline(chatParticipants: ChatParticipationDto[]): Promise<void> {
        await this.websocketEventsPublisher.publishChatParticipantsWentOnline(chatParticipants);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.participants.offline.#",
        queue: `events_service_chat_participants_offline-${config.EVENTS_SERVICE_PORT}`
    })
    public async onChatParticipantsWentOffline(chatParticipants: ChatParticipationDto[]): Promise<void> {
        await this.websocketEventsPublisher.publishChatParticipantsWentOffline(chatParticipants);
    }
}
