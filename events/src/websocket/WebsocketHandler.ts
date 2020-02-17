import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway
} from "@nestjs/websockets";
import {JwtService} from "@nestjs/jwt";
import {AmqpConnection, RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {Socket} from "socket.io";
import {parse} from "querystring";
import {ChatSubscription, ChatUnsubscription, EventType, JwtPayload, MessageDeleted, WebsocketEvent} from "./types";
import {ChatMessage} from "../common/types";
import {ChatParticipationService} from "../chat";

@WebSocketGateway({
    path: "/api/v1/events"
})
export class WebsocketHandler implements OnGatewayConnection, OnGatewayDisconnect {
    private usersAndClientsMap: {[userId: string]: Socket[]} = {};
    private chatSubscriptionsMap: {[chatId: string]: Socket[]} = {};
    private connectedClients: Socket[] = [];

    constructor(private readonly jwtService: JwtService,
                private readonly amqpConnection: AmqpConnection,
                private readonly chatParticipationService: ChatParticipationService) {}

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
                    sessionId: client.id
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
                    sessionId: client.id
                }
            )
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

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "events_service_message_created",
        routingKey: "chat.message.created.#"
    })
    public async onMessageCreated(message: ChatMessage) {
        const messageCreatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_CREATED,
            payload: message
        };
        await this.publishEventToChatParticipants(message.chatId, messageCreatedEvent);
        await this.publishEventToUsersSubscribedToChat(message.chatId, messageCreatedEvent);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "events_service_message_updated",
        routingKey: "chat.message.updated.#"
    })
    public async onMessageUpdated(message: ChatMessage) {
        const messageUpdatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_UPDATED,
            payload: message
        };
        await this.publishEventToChatParticipants(message.chatId, messageUpdatedEvent);
        await this.publishEventToUsersSubscribedToChat(message.chatId, messageUpdatedEvent);
    }

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "events_service_message_deleted",
        routingKey: "chat.message.deleted.#"
    })
    public async onMessageDeleted(messageDeleted: MessageDeleted) {
        const messageDeletedEvent: WebsocketEvent<MessageDeleted> = {
            type: EventType.MESSAGE_DELETED,
            payload: messageDeleted
        };
        await this.publishEventToChatParticipants(messageDeleted.chatId, messageDeletedEvent);
        await this.publishEventToUsersSubscribedToChat(messageDeleted.chatId, messageDeletedEvent);
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

    private async publishEventToUsersSubscribedToChat(chatId: string, event: WebsocketEvent<any>): Promise<void> {
        if (this.chatSubscriptionsMap[chatId] !== undefined) {
            this.chatSubscriptionsMap[chatId].forEach(client => client.emit(event.type, event));
        }
    }
}
