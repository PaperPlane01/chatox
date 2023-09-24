import {ForbiddenException, forwardRef, Inject} from "@nestjs/common";
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
import {
    ChatSubscription,
    ChatUnsubscription,
    EventType,
    JwtPayload,
    MessageDeleted,
    MessageRead,
    MessagesDeleted,
    SessionActivityStatusResponse,
    WebsocketEvent
} from "./types";
import {Chat, ChatBlocking, ChatMessage, GlobalBan} from "../common/types";
import {
    BalanceUpdated,
    ChatDeleted,
    PrivateChatCreated,
    UserKickedFromChat,
    UserLeftChat,
    UserStartedTyping
} from "../common/types/events";
import {ChatParticipationService} from "../chat-participation";
import {ChatParticipation} from "../chat-participation/entities";
import {ChatParticipationDto} from "../chat-participation/types";
import {LoggerFactory} from "../logging";
import {ChatsService} from "../chats/ChatsService";
import {ChatFeatures, ChatRoleResponse} from "../chat-roles";

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
    private readonly log = LoggerFactory.getLogger(WebsocketEventsPublisher);

    constructor(private readonly jwtService: JwtService,
                private readonly amqpConnection: AmqpConnection,
                @Inject(forwardRef(() => ChatParticipationService)) private readonly chatParticipationService: ChatParticipationService,
                @Inject(forwardRef(() => ChatsService)) private readonly chatsService: ChatsService) {}

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

            this.log.debug("Publishing user connected event");
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
            this.log.debug("Publishing user disconnected event");
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
    public async handleChatSubscription(@MessageBody() message: WebsocketEvent<ChatSubscription>,
                                        @ConnectedSocket() client: Socket): Promise<void> {
        const chatId = message.payload.chatId;
        const chat = await this.chatsService.findPrivateChatById(chatId);

        if (chat) {
            throw new ForbiddenException("Subscriptions to private chats is prohibited");
        }

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
        this.log.debug("Publishing new message");
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
        this.log.debug(`Publishing ${EventType.MESSAGES_DELETED} event`);
        this.log.debug(JSON.stringify(messageDeleted));
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

    public async publishUserLeftChat(userLeftChat: UserLeftChat) {
        const userLeftEvent: WebsocketEvent<UserLeftChat> = {
            type: EventType.USER_LEFT_CHAT,
            payload: userLeftChat
        };
        await this.publishEventToChatParticipants(userLeftChat.chatId, userLeftEvent);
        await this.publishEventToUsersSubscribedToChat(userLeftChat.chatId, userLeftEvent);
        await this.publishEventToUser(userLeftChat.userId, userLeftEvent);
    }

    public async publishUserKickedFromChat(userKickedFromChat: UserKickedFromChat) {
        const userKickedEvent: WebsocketEvent<UserKickedFromChat> = {
            type: EventType.USER_KICKED_FROM_CHAT,
            payload: userKickedFromChat
        };
        await this.publishEventToChatParticipants(userKickedFromChat.chatId, userKickedEvent);
        await this.publishEventToUsersSubscribedToChat(userKickedFromChat.chatId, userKickedEvent);
        await this.publishEventToUser(userKickedFromChat.userId, userKickedEvent);
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

    public async publishChatParticipantUpdated(chatParticipant: ChatParticipationDto) {
        const chatParticipantUpdated: WebsocketEvent<ChatParticipationDto> = {
            payload: chatParticipant,
            type: EventType.CHAT_PARTICIPANT_UPDATED
        };
        await this.publishEventToChatParticipants(chatParticipant.chatId, chatParticipantUpdated);
    }

    public async publishChatUpdated(chat: Chat) {
        const chatUpdated: WebsocketEvent<Chat> = {
            payload: chat,
            type: EventType.CHAT_UPDATED
        };
        await Promise.all([
            this.publishEventToChatParticipants(chat.id, chatUpdated),
            this.publishEventToUsersSubscribedToChat(chat.id, chatUpdated)
        ]);
    }

    public async publishChatDeleted(chatDeleted: ChatDeleted) {
        const chatDeletedEvent: WebsocketEvent<ChatDeleted> = {
            payload: chatDeleted,
            type: EventType.CHAT_DELETED
        };
        await Promise.all([
            this.publishEventToChatParticipants(chatDeleted.id, chatDeletedEvent),
            this.publishEventToUsersSubscribedToChat(chatDeleted.id, chatDeletedEvent)
        ]);
    }

    public async publishGlobalBanCreated(globalBan: GlobalBan) {
        const globalBanCreatedEvent: WebsocketEvent<GlobalBan> = {
            payload: globalBan,
            type: EventType.GLOBAL_BAN_CREATED
        };
        await this.publishEventToUser(globalBan.bannedUser.id, globalBanCreatedEvent);
    }

    public async publishGlobalBanUpdated(globalBan: GlobalBan) {
        const globalBanUpdatedEvent: WebsocketEvent<GlobalBan> = {
            payload: globalBan,
            type: EventType.GLOBAL_BAN_UPDATED
        };
        await this.publishEventToUser(globalBan.bannedUser.id, globalBanUpdatedEvent);
    }

    public async publishMessagePinned(message: ChatMessage) {
        const messagePinnedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.MESSAGE_PINNED
        };
        await Promise.all([
            this.publishEventToChatParticipants(message.chatId, messagePinnedEvent),
            this.publishEventToUsersSubscribedToChat(message.chatId, messagePinnedEvent)
        ]);
    }

    public async publishMessageUnpinned(message: ChatMessage) {
        const messageUnpinnedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.MESSAGE_UNPINNED
        };
        await Promise.all([
            this.publishEventToChatParticipants(message.chatId, messageUnpinnedEvent),
            this.publishEventToUsersSubscribedToChat(message.chatId, messageUnpinnedEvent)
        ]);
    }

    public async publishScheduledMessageCreated(message: ChatMessage) {
        const scheduledMessageCreatedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.SCHEDULED_MESSAGE_CREATED
        };
        await this.publishEventsToChatParticipantsWithEnabledFeatures(
            message.chatId,
            scheduledMessageCreatedEvent,
            "scheduleMessages"
        );
    }

    public async publishScheduledMessagePublished(message: ChatMessage) {
        const scheduledMessagePublishedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.SCHEDULED_MESSAGE_PUBLISHED
        };
        await this.publishEventsToChatParticipantsWithEnabledFeatures(
            message.chatId,
            scheduledMessagePublishedEvent,
            "scheduleMessages"
        );
     }

     public async publishScheduledMessageDeleted(messageDeleted: MessageDeleted) {
        const scheduledMessageDeletedEvent: WebsocketEvent<MessageDeleted> = {
            payload: messageDeleted,
            type: EventType.SCHEDULED_MESSAGE_DELETED
        };
        await this.publishEventsToChatParticipantsWithEnabledFeatures(
            messageDeleted.chatId,
            scheduledMessageDeletedEvent,
            "scheduleMessages"
        );
     }

     public async publishScheduledMessageUpdated(message: ChatMessage) {
        const scheduledMessageUpdatedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.SCHEDULED_MESSAGE_UPDATED
        };
        await this.publishEventsToChatParticipantsWithEnabledFeatures(
            message.chatId,
            scheduledMessageUpdatedEvent,
            "scheduleMessages"
        );
    }

    public async publishMessageRead(messageRead: MessageRead) {
        const messageReadEvent: WebsocketEvent<MessageRead> = {
            payload: messageRead,
            type: EventType.MESSAGE_READ
        };
        await this.publishEventToUser(messageRead.userId, messageReadEvent);
    }

    public async publishPrivateChatCreated(privateChatCreated: PrivateChatCreated) {
        const privateChatCreatedEvent: WebsocketEvent<PrivateChatCreated> = {
            payload: privateChatCreated,
            type: EventType.PRIVATE_CHAT_CREATED
        };
        const usersIds = privateChatCreated.chatParticipations.map(chatParticipant => chatParticipant.user.id);

        for (const userId of usersIds) {
            await this.publishEventToUser(userId, privateChatCreatedEvent);
        }
     }

     public async publishChatRoleCreated(chatRole: ChatRoleResponse) {
        const chatRoleCreated: WebsocketEvent<ChatRoleResponse> = {
            payload: chatRole,
            type: EventType.CHAT_ROLE_CREATED
        };
        await this.publishEventToChatParticipants(chatRole.chatId, chatRoleCreated);
     }

     public async publishChatRoleUpdated(chatRole: ChatRoleResponse) {
        const chatRoleUpdated: WebsocketEvent<ChatRoleResponse> = {
            payload: chatRole,
            type: EventType.CHAT_ROLE_UPDATED
        };
        await this.publishEventToChatParticipants(chatRole.chatId, chatRoleUpdated);
      }

      public async publishBalanceUpdated(balance: BalanceUpdated) {
        const balanceUpdated: WebsocketEvent<BalanceUpdated> = {
            payload: balance,
            type: EventType.BALANCE_UPDATED
        };
        await this.publishEventToUser(balance.userId, balanceUpdated);
      }

      public async publishUserStartedTyping(userStartedTyping: UserStartedTyping) {
        const event: WebsocketEvent<UserStartedTyping> = {
            payload: userStartedTyping,
            type: EventType.USER_STARTED_TYPING
        };
        await this.publishEventToChatParticipants(userStartedTyping.chatId, event);
      }

    private async publishEventToChatParticipants(chatId: string, event: WebsocketEvent): Promise<void> {
        const chatParticipants = await this.chatParticipationService.findByChatId(chatId);
        this.log.debug("Publishing event to chat participants");
        this.log.verbose(`The following chat participants will receive an event: ${JSON.stringify(chatParticipants.map(chatParticipant => chatParticipant._id))}`);
        this.log.consoleLog(event);

        await this.publishEventsToGivenParticipants(chatParticipants, event);
    }

    private async publishEventsToChatParticipantsWithEnabledFeatures(chatId: string,
                                                                     event: WebsocketEvent,
                                                                     ...features: Array<keyof ChatFeatures>) {
        const chatParticipants = await this.chatParticipationService.findChatParticipationsWithEnabledFeatures(
            chatId,
            features
        );
        await this.publishEventsToGivenParticipants(chatParticipants, event);
    }

    private async publishEventsToGivenParticipants(chatParticipants: ChatParticipation[], event: WebsocketEvent): Promise<void> {
        await Promise.all(
            chatParticipants.map(chatParticipant => this.publishEventToUser(chatParticipant.userId, event))
        );
    }

    private async publishEventToUser(userId: string, event: WebsocketEvent): Promise<void> {
        const clients = this.usersAndClientsMap[userId];

        if (clients && clients.length !== 0) {
            clients.forEach(client => {
                this.log.verbose(`Publishing event ${event.type} to socket ${client.id}`);
                client.emit(event.type, event);
            });
        }
    }

    private async publishEventToUsersSubscribedToChat(chatId: string, event: WebsocketEvent): Promise<void> {
        if (this.chatSubscriptionsMap[chatId] !== undefined) {
            this.chatSubscriptionsMap[chatId].forEach(client => client.emit(event.type, event));
        }
    }
}
