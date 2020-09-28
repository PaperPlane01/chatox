import {forwardRef, Inject, Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {ChatParticipationService} from "./ChatParticipationService";
import {ChatParticipationDto} from "./types";
import {WebsocketEventsPublisher} from "../websocket";
import {config} from "../env-config";

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
        console.log("Received userJoinedChat event");
        await this.chatParticipationService.saveChatParticipation(createChatParticipationDto);
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
    public async onCHatParticipantsWentOffline(chatParticipants: ChatParticipationDto[]): Promise<void> {
        await this.websocketEventsPublisher.publishChatParticipantsWentOffline(chatParticipants);
    }
}
