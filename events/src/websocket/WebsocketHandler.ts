import {OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway} from "@nestjs/websockets";
import {JwtService} from "@nestjs/jwt";
import {AmqpConnection, RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {Socket} from "socket.io";
import {parse} from "querystring";
import {EventType, JwtPayload, WebsocketEvent} from "./types";
import {ChatMessage} from "../common/types";

@WebSocketGateway({
    path: "/api/v1/events"
})
export class WebsocketHandler implements OnGatewayConnection, OnGatewayDisconnect {
    private usersAndClientsMap: {[userId: string]: Socket[]} = {};
    private connectedClients: Socket[] = [];

    constructor(private readonly jwtService: JwtService,
                private readonly amqpConnection: AmqpConnection) {}

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

    @RabbitSubscribe({
        exchange: "chat.events",
        queue: "events_service_message_created",
        routingKey: "chat.message.created.#"
    })
    public handleNewChatMessage(message: ChatMessage) {
        const messageCreatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_CREATED,
            payload: message
        };
        this.connectedClients.forEach(client => client.emit(EventType.MESSAGE_CREATED, messageCreatedEvent));
    }
}
