import {forwardRef, Inject} from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway
} from "@nestjs/websockets";
import {JwtService} from "@nestjs/jwt";
import {AmqpConnection} from "@nestjs-plus/rabbitmq";
import {Socket} from "socket.io";
import {parse} from "querystring";
import {ChatSubscription, ChatUnsubscription, EventType, JwtPayload, MessageDeleted, WebsocketEvent} from "./types";
import {MessagesDeleted} from "./types/MessagesDeleted";
import {SessionActivityStatusResponse} from "./types/SessionActivityStatusResponse";
import {ChatBlocking, ChatMessage} from "../common/types";
import {ChatParticipationService} from "../chat-participation";
import {ChatParticipationDto} from "../chat-participation/types";

@WebSocketGateway({
    path: "/api/v1/events/",
    transports: [
        "websocket",
        "polling"
    ]
})
export class WebsocketEventsPublisher implements OnGatewayConnection, OnGatewayDisconnect {
    private usersAndClientsMap: {[userId: string]: Socket[]} = {};
    private chatSubscriptionsMap: {[chatId: string]: Socket[]} = {};
    private connectedClients: Socket[] = [];

    constructor(private readonly jwtService: JwtService,
                private readonly amqpConnection: AmqpConnection,
                @Inject(forwardRef(() => ChatParticipationService)) private readonly chatParticipationService: ChatParticipationService) {}

    public handleConnection(client: Socket, ...args: any[]): void {
        const queryParameters = client.handshake.query
            ? typeof client.handshake.query === "object" ? client.handshake.query : parse(client.handshake.query)
            : {};
        if (queryParameters.accessToken) {
            const jwtPayload: JwtPayload = this.jwtService.verify<JwtPayload>(client.handshake.query.accessToken as string);

            if (this.usersAndClientsMap[jwtPayload.user_id] !== undefined) {
                this.usersAndClientsMap[jwtPayload.user_id].push(client);
            } else {
                this.usersAndClientsMap[jwtPayload.user_id] = [client];
            }

            this.amqpConnection.publish(
                "websocket.events",
                "user.connected.#",
                {
                    userId: jwtPayload.user_id,
                    socketIoId: client.id,
                    ipAddress: client.request.connection.remoteAddress,
                    userAgent: client.request.headers["user-agent"],
                    accessToken: queryParameters.accessToken
                }
            )
        }

        this.connectedClients.push(client);
    }

    public handleDisconnect(client: Socket): void {
        this.connectedClients = this.connectedClients.filter(connectedClient => connectedClient.id !== client.id);

        let disconnectedUserId: string | undefined;
        const usersToDelete: string[] = [];

        Object.keys(this.usersAndClientsMap).forEach(userId => {
            if (this.usersAndClientsMap[userId] !== undefined) {
                disconnectedUserId = userId;
                this.usersAndClientsMap[userId] = this.usersAndClientsMap[userId]
                    .filter(connectedClient => connectedClient.id !== client.id);
                if (this.usersAndClientsMap[userId].length === 0) {
                    usersToDelete.push(userId);
                }
            }
        });

        usersToDelete.forEach(userId => delete this.usersAndClientsMap[userId]);

        if (disconnectedUserId) {
            this.amqpConnection.publish(
                "websocket.events",
                "user.disconnected.#",
                {
                    userId: disconnectedUserId,
                    socketIoId: client.id
                }
            )
        }
    }

    public isSessionActive(socketIoId: string): SessionActivityStatusResponse {
        const active = this.connectedClients.filter(client => client.id === socketIoId).length !== 0;
        return {active};
    }

    public getSessionsOfUser(userId: string): string[] {
        if (this.usersAndClientsMap[userId]) {
            return this.usersAndClientsMap[userId].map(client => client.id);
        } else {
            return [];
        }
    }

    @SubscribeMessage(EventType.CHAT_SUBSCRIPTION)
    public handleChatSubscription(@MessageBody() message: WebsocketEvent<ChatSubscription>,
                                  @ConnectedSocket() client: Socket): void {
        const chatId = message.payload.chatId;

        if (this.chatSubscriptionsMap[chatId] !== undefined) {
            this.chatSubscriptionsMap[chatId].push(client);
        } else {
            this.chatSubscriptionsMap[chatId] = [client];
        }
    }

    @SubscribeMessage(EventType.CHAT_UNSUBSCRIPTION)
    public handleChatUnsubscription(@MessageBody() message: WebsocketEvent<ChatUnsubscription>,
                                    @ConnectedSocket() client: Socket): void {
        const chatId = message.payload.chatId;

        if (this.chatSubscriptionsMap[chatId] !== undefined) {
            this.chatSubscriptionsMap[chatId] = this.chatSubscriptionsMap[chatId]
                .filter(connectedClient => connectedClient.id !== chatId);

            if (this.chatSubscriptionsMap[chatId].length === 0) {
                delete this.chatSubscriptionsMap[chatId];
            }
        }
    }

    public async publishMessageCreated(message: ChatMessage) {
        const messageCreatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_CREATED,
            payload: message
        };
        console.log("publishing new message");
        await this.publishEventToChatParticipants(message.chatId, messageCreatedEvent);
        await this.publishEventToUsersSubscribedToChat(message.chatId, messageCreatedEvent);
    }

    public async publishMessageUpdated(message: ChatMessage) {
        const messageUpdatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_UPDATED,
            payload: message
        };
        await this.publishEventToChatParticipants(message.chatId, messageUpdatedEvent);
        await this.publishEventToUsersSubscribedToChat(message.chatId, messageUpdatedEvent);
    }

    public async publishMessageDeleted(messageDeleted: MessageDeleted) {
        const messageDeletedEvent: WebsocketEvent<MessageDeleted> = {
            type: EventType.MESSAGE_DELETED,
            payload: messageDeleted
        };
        await this.publishEventToChatParticipants(messageDeleted.chatId, messageDeletedEvent);
        await this.publishEventToUsersSubscribedToChat(messageDeleted.chatId, messageDeletedEvent);
    }

    public async publishMessagesDeleted(messagesDeleted: MessagesDeleted) {
        const messagesDeletedEvent: WebsocketEvent<MessagesDeleted> = {
            type: EventType.MESSAGES_DELETED,
            payload: messagesDeleted
        };
        await this.publishEventToChatParticipants(messagesDeleted.chatId, messagesDeletedEvent);
        await this.publishEventToUsersSubscribedToChat(messagesDeleted.chatId, messagesDeletedEvent);
    }

    public async publishUserJoinedChat(createChatParticipationDto: ChatParticipationDto) {
        const userJoinedEvent: WebsocketEvent<ChatParticipationDto> = {
            type: EventType.USER_JOINED_CHAT,
            payload: createChatParticipationDto
        };
        await this.publishEventToChatParticipants(createChatParticipationDto.chatId, userJoinedEvent);
        await this.publishEventToUsersSubscribedToChat(createChatParticipationDto.chatId, userJoinedEvent);
    }

    public async publishChatBlockingCreated(chatBlocking: ChatBlocking) {
        const chatBlockingCreated: WebsocketEvent<ChatBlocking> = {
            type: EventType.CHAT_BLOCKING_CREATED,
            payload: chatBlocking
        };
        await this.publishEventToUser(chatBlocking.blockedUser.id, chatBlockingCreated);
    }

    public async publishChatBlockingUpdated(chatBlocking: ChatBlocking) {
        const chatBlockingUpdated: WebsocketEvent<ChatBlocking> = {
            type: EventType.CHAT_BLOCKING_UPDATED,
            payload: chatBlocking
        };
        await this.publishEventToUser(chatBlocking.blockedUser.id, chatBlockingUpdated);
    }

    public async publishChatParticipantsWentOnline(chatParticipants: ChatParticipationDto[]) {
        chatParticipants.forEach(participant => {
            const chatParticipantWentOnline: WebsocketEvent<ChatParticipationDto> = {
                payload: participant,
                type: EventType.CHAT_PARTICIPANT_WENT_ONLINE
            };
            this.publishEventToChatParticipants(participant.chatId, chatParticipantWentOnline);
            this.publishEventToUsersSubscribedToChat(participant.chatId, chatParticipantWentOnline);
        })
    }

    public async publishChatParticipantsWentOffline(chatParticipants: ChatParticipationDto[]) {
        chatParticipants.forEach(participant => {
            const chatParticipantWentOffline: WebsocketEvent<ChatParticipationDto> = {
                payload: participant,
                type: EventType.CHAT_PARTICIPANT_WENT_OFFLINE
            };
            this.publishEventToChatParticipants(participant.chatId, chatParticipantWentOffline);
            this.publishEventToUsersSubscribedToChat(participant.chatId, chatParticipantWentOffline);
        })
    }

    private async publishEventToChatParticipants(chatId: string, event: WebsocketEvent<any>): Promise<void> {
        const chatParticipants = await this.chatParticipationService.findByChatId(chatId);

        chatParticipants.forEach(participant => {
            if (this.usersAndClientsMap[participant.userId] !== undefined) {
                this.usersAndClientsMap[participant.userId].forEach(client => {
                    client.emit(event.type, event);
                })
            }
        });
    }

    private async publishEventToUser(userId: string, event: WebsocketEvent<any>): Promise<void> {
        const clients = this.usersAndClientsMap[userId];

        if (clients && clients.length !== 0) {
            clients.forEach(client => client.emit(event.type, event));
        }
    }

    private async publishEventToUsersSubscribedToChat(chatId: string, event: WebsocketEvent<any>): Promise<void> {
        if (this.chatSubscriptionsMap[chatId] !== undefined) {
            this.chatSubscriptionsMap[chatId].forEach(client => client.emit(event.type, event));
        }
    }
}
