import {ForbiddenException, forwardRef, Inject} from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway
} from "@nestjs/websockets";
import {AmqpConnection} from "@golevelup/nestjs-rabbitmq";
import {Socket} from "socket.io";
import {
    ChatSubscription,
    ChatUnsubscription,
    EventType,
    MessageDeleted,
    MessageRead,
    MessagesDeleted,
    SessionActivityStatusResponse,
    WebsocketEvent
} from "./types";
import {WebsocketConnectionsStateHolder} from "./WebsocketConnectionsStateHolder";
import {Chat, ChatBlocking, ChatMessage, GlobalBan} from "../common/types";
import {
    BalanceUpdated,
    ChatDeleted,
    PrivateChatCreated,
    UserKickedFromChat,
    UserLeftChat,
    UserStartedTyping
} from "../common/types/events";
import {ChatParticipationDto} from "../chat-participation/types";
import {LoggerFactory} from "../logging";
import {ChatsService} from "../chats/ChatsService";
import {ChatRoleResponse} from "../chat-roles";

@WebSocketGateway({
    path: "/api/v1/events/",
    transports: [
        "websocket",
        "polling"
    ]
})
export class WebsocketEventsPublisher implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly log = LoggerFactory.getLogger(WebsocketEventsPublisher);

    constructor(private readonly amqpConnection: AmqpConnection,
                private readonly connectionsStateHolder: WebsocketConnectionsStateHolder,
                @Inject(forwardRef(() => ChatsService)) private readonly chatsService: ChatsService) {
    }

    public async handleConnection(client: Socket, ...args: any[]): Promise<void> {
        const jwtPayload = await this.connectionsStateHolder.handleConnection(client);

        if (jwtPayload) {
            this.log.debug("Publishing user connected event");
            this.amqpConnection.publish(
                "websocket.events",
                "user.connected.#",
                {
                    userId: jwtPayload.user_id,
                    socketIoId: client.id,
                    ipAddress: client.request.connection.remoteAddress,
                    userAgent: client.request.headers["user-agent"],
                    accessToken: jwtPayload.accessToken
                }
            )
        }
    }

    public handleDisconnect(client: Socket): void {
        const {noMoreConnections, userId} = this.connectionsStateHolder.handleDisconnect(client);

        if (noMoreConnections && userId) {
            this.log.debug("Publishing user disconnected event");
            this.amqpConnection.publish(
                "websocket.events",
                "user.disconnected.#",
                {
                    userId,
                    socketIoId: client.id
                }
            );
        }
    }

    public isSessionActive(socketIoId: string): SessionActivityStatusResponse {
        const active = this.connectionsStateHolder.isSocketActive(socketIoId);
        return {active};
    }

    public getSessionsOfUser(userId: string): string[] {
        return this.connectionsStateHolder.getSocketIdsOfUser(userId);
    }

    @SubscribeMessage(EventType.CHAT_SUBSCRIPTION)
    public async handleChatSubscription(@MessageBody() message: WebsocketEvent<ChatSubscription>,
                                        @ConnectedSocket() client: Socket): Promise<void> {
        const chatId = message.payload.chatId;
        const chat = await this.chatsService.findPrivateChatById(chatId);

        if (chat) {
            throw new ForbiddenException("Subscriptions to private chats is prohibited");
        }

        this.connectionsStateHolder.subscribeSocketToChat(client, chatId);
    }

    @SubscribeMessage(EventType.CHAT_UNSUBSCRIPTION)
    public handleChatUnsubscription(@MessageBody() message: WebsocketEvent<ChatUnsubscription>,
                                    @ConnectedSocket() client: Socket): void {
        this.connectionsStateHolder.unsubscribeSocketFromChat(client, message.payload.chatId);
    }

    public async publishMessageCreated(message: ChatMessage) {
        const messageCreatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_CREATED,
            payload: message
        };
        this.log.debug("Publishing new message");
        await this.connectionsStateHolder.publishEventToChatParticipants(message.chatId, messageCreatedEvent);
        await this.connectionsStateHolder.publishEventToUsersSubscribedToChat(message.chatId, messageCreatedEvent);
    }

    public async publishMessageUpdated(message: ChatMessage) {
        const messageUpdatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_UPDATED,
            payload: message
        };
        await this.connectionsStateHolder.publishEventToChatParticipants(message.chatId, messageUpdatedEvent);
        await this.connectionsStateHolder.publishEventToUsersSubscribedToChat(message.chatId, messageUpdatedEvent);
    }

    public async publishMessageDeleted(messageDeleted: MessageDeleted) {
        const messageDeletedEvent: WebsocketEvent<MessageDeleted> = {
            type: EventType.MESSAGE_DELETED,
            payload: messageDeleted
        };
        this.log.debug(`Publishing ${EventType.MESSAGES_DELETED} event`);
        this.log.debug(JSON.stringify(messageDeleted));

        await this.connectionsStateHolder.publishEventToChatParticipants(messageDeleted.chatId, messageDeletedEvent);
        await this.connectionsStateHolder.publishEventToUsersSubscribedToChat(
            messageDeleted.chatId,
            messageDeletedEvent
        );
    }

    public async publishMessagesDeleted(messagesDeleted: MessagesDeleted) {
        const messagesDeletedEvent: WebsocketEvent<MessagesDeleted> = {
            type: EventType.MESSAGES_DELETED,
            payload: messagesDeleted
        };
        await this.connectionsStateHolder.publishEventToChatParticipants(messagesDeleted.chatId, messagesDeletedEvent);
        await this.connectionsStateHolder.publishEventToUsersSubscribedToChat(
            messagesDeleted.chatId,
            messagesDeletedEvent
        );
    }

    public async publishUserJoinedChat(createChatParticipationDto: ChatParticipationDto) {
        const userJoinedEvent: WebsocketEvent<ChatParticipationDto> = {
            type: EventType.USER_JOINED_CHAT,
            payload: createChatParticipationDto
        };
        await this.connectionsStateHolder.publishEventToUsers(
            [createChatParticipationDto.user.id],
            userJoinedEvent
        );
        await this.connectionsStateHolder.publishEventToChatParticipants(
            createChatParticipationDto.chatId,
            userJoinedEvent
        );
        await this.connectionsStateHolder.publishEventToUsersSubscribedToChat(
            createChatParticipationDto.chatId,
            userJoinedEvent
        );
        this.connectionsStateHolder.addUserToChat(createChatParticipationDto.user.id, createChatParticipationDto.chatId);
    }

    public async publishUserLeftChat(userLeftChat: UserLeftChat) {
        const userLeftEvent: WebsocketEvent<UserLeftChat> = {
            type: EventType.USER_LEFT_CHAT,
            payload: userLeftChat
        };
        await this.connectionsStateHolder.publishEventToUsers(
            [userLeftChat.userId],
            userLeftEvent
        );
        await this.connectionsStateHolder.publishEventToChatParticipants(
            userLeftChat.chatId,
            userLeftEvent
        );
        await this.connectionsStateHolder.publishEventToUsersSubscribedToChat(
            userLeftChat.chatId,
            userLeftEvent
        );
        this.connectionsStateHolder.removeUserFromChat(userLeftChat.userId, userLeftChat.chatId);
    }

    public async publishUserKickedFromChat(userKickedFromChat: UserKickedFromChat) {
        const userKickedEvent: WebsocketEvent<UserKickedFromChat> = {
            type: EventType.USER_KICKED_FROM_CHAT,
            payload: userKickedFromChat
        };
        await this.connectionsStateHolder.publishEventToUsers(
            [userKickedFromChat.userId],
            userKickedEvent
        );
        await this.connectionsStateHolder.publishEventToChatParticipants(
            userKickedFromChat.chatId,
            userKickedEvent
        );
        await this.connectionsStateHolder.publishEventToUsersSubscribedToChat(
            userKickedFromChat.chatId,
            userKickedEvent
        );
        this.connectionsStateHolder.removeUserFromChat(userKickedFromChat.userId, userKickedFromChat.chatId);
    }

    public async publishChatBlockingCreated(chatBlocking: ChatBlocking) {
        const chatBlockingCreated: WebsocketEvent<ChatBlocking> = {
            type: EventType.CHAT_BLOCKING_CREATED,
            payload: chatBlocking
        };
        await this.connectionsStateHolder.publishEventToUsers([chatBlocking.blockedUser.id], chatBlockingCreated);
    }

    public async publishChatBlockingUpdated(chatBlocking: ChatBlocking) {
        const chatBlockingUpdated: WebsocketEvent<ChatBlocking> = {
            type: EventType.CHAT_BLOCKING_UPDATED,
            payload: chatBlocking
        };
        await this.connectionsStateHolder.publishEventToUsers([chatBlocking.blockedUser.id], chatBlockingUpdated);
    }

    public async publishChatParticipantsWentOnline(chatParticipants: ChatParticipationDto[]) {
        chatParticipants.forEach(participant => {
            const chatParticipantWentOnline: WebsocketEvent<ChatParticipationDto> = {
                payload: participant,
                type: EventType.CHAT_PARTICIPANT_WENT_ONLINE
            };
            this.connectionsStateHolder.publishEventToChatParticipants(
                participant.chatId,
                chatParticipantWentOnline
            )
            this.connectionsStateHolder.publishEventToUsersSubscribedToChat(
                participant.chatId,
                chatParticipantWentOnline
            );
        })
    }

    public async publishChatParticipantsWentOffline(chatParticipants: ChatParticipationDto[]) {
        chatParticipants.forEach(participant => {
            const chatParticipantWentOffline: WebsocketEvent<ChatParticipationDto> = {
                payload: participant,
                type: EventType.CHAT_PARTICIPANT_WENT_OFFLINE
            };
            this.connectionsStateHolder.publishEventToChatParticipants(
                participant.chatId,
                chatParticipantWentOffline
            )
            this.connectionsStateHolder.publishEventToUsersSubscribedToChat(
                participant.chatId,
                chatParticipantWentOffline
            );
        })
    }

    public async publishChatParticipantUpdated(chatParticipant: ChatParticipationDto) {
        const chatParticipantUpdated: WebsocketEvent<ChatParticipationDto> = {
            payload: chatParticipant,
            type: EventType.CHAT_PARTICIPANT_UPDATED
        };
        await this.connectionsStateHolder.publishEventToChatParticipants(chatParticipant.chatId, chatParticipantUpdated);
    }

    public async publishChatUpdated(chat: Chat) {
        const chatUpdated: WebsocketEvent<Chat> = {
            payload: chat,
            type: EventType.CHAT_UPDATED
        };
        await Promise.all([
            this.connectionsStateHolder.publishEventToChatParticipants(chat.id, chatUpdated),
            this.connectionsStateHolder.publishEventToChatParticipants(chat.id, chatUpdated)
        ]);
    }

    public async publishChatDeleted(chatDeleted: ChatDeleted) {
        const chatDeletedEvent: WebsocketEvent<ChatDeleted> = {
            payload: chatDeleted,
            type: EventType.CHAT_DELETED
        };
        await Promise.all([
            this.connectionsStateHolder.publishEventToChatParticipants(chatDeleted.id, chatDeletedEvent),
            this.connectionsStateHolder.publishEventToChatParticipants(chatDeleted.id, chatDeletedEvent)
        ]);
    }

    public async publishGlobalBanCreated(globalBan: GlobalBan) {
        const globalBanCreatedEvent: WebsocketEvent<GlobalBan> = {
            payload: globalBan,
            type: EventType.GLOBAL_BAN_CREATED
        };
        await this.connectionsStateHolder.publishEventToUsers([globalBan.bannedUser.id], globalBanCreatedEvent);
    }

    public async publishGlobalBanUpdated(globalBan: GlobalBan) {
        const globalBanUpdatedEvent: WebsocketEvent<GlobalBan> = {
            payload: globalBan,
            type: EventType.GLOBAL_BAN_UPDATED
        };
        await this.connectionsStateHolder.publishEventToUsers([globalBan.bannedUser.id], globalBanUpdatedEvent);
    }

    public async publishMessagePinned(message: ChatMessage) {
        const messagePinnedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.MESSAGE_PINNED
        };
        await Promise.all([
            this.connectionsStateHolder.publishEventToChatParticipants(message.chatId, messagePinnedEvent),
            this.connectionsStateHolder.publishEventToUsersSubscribedToChat(message.chatId, messagePinnedEvent)
        ]);
    }

    public async publishMessageUnpinned(message: ChatMessage) {
        const messageUnpinnedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.MESSAGE_UNPINNED
        };
        await Promise.all([
            this.connectionsStateHolder.publishEventToChatParticipants(message.chatId, messageUnpinnedEvent),
            this.connectionsStateHolder.publishEventToUsersSubscribedToChat(message.chatId, messageUnpinnedEvent)
        ]);
    }

    public async publishScheduledMessageCreated(message: ChatMessage) {
        const scheduledMessageCreatedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.SCHEDULED_MESSAGE_CREATED
        };
        await this.connectionsStateHolder.publishEventToChatParticipantsWithEnabledFeatures(
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
        await this.connectionsStateHolder.publishEventToChatParticipantsWithEnabledFeatures(
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
        await this.connectionsStateHolder.publishEventToChatParticipantsWithEnabledFeatures(
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
        await this.connectionsStateHolder.publishEventToChatParticipantsWithEnabledFeatures(
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
        await this.connectionsStateHolder.publishEventToUsers([messageRead.messageSenderId], messageReadEvent);
    }

    public async publishPrivateChatCreated(privateChatCreated: PrivateChatCreated) {
        const privateChatCreatedEvent: WebsocketEvent<PrivateChatCreated> = {
            payload: privateChatCreated,
            type: EventType.PRIVATE_CHAT_CREATED
        };
        const usersIds = privateChatCreated.chatParticipations.map(chatParticipant => chatParticipant.user.id);
        await this.connectionsStateHolder.publishEventToUsers(usersIds, privateChatCreatedEvent);
    }

    public async publishChatRoleCreated(chatRole: ChatRoleResponse) {
        const chatRoleCreated: WebsocketEvent<ChatRoleResponse> = {
            payload: chatRole,
            type: EventType.CHAT_ROLE_CREATED
        };
        await this.connectionsStateHolder.publishEventToChatParticipants(chatRole.chatId, chatRoleCreated);
    }

    public async publishChatRoleUpdated(chatRole: ChatRoleResponse) {
        const chatRoleUpdated: WebsocketEvent<ChatRoleResponse> = {
            payload: chatRole,
            type: EventType.CHAT_ROLE_UPDATED
        };
        await this.connectionsStateHolder.publishEventToChatParticipants(chatRole.chatId, chatRoleUpdated);
    }

    public async publishBalanceUpdated(balance: BalanceUpdated) {
        const balanceUpdated: WebsocketEvent<BalanceUpdated> = {
            payload: balance,
            type: EventType.BALANCE_UPDATED
        };
        await this.connectionsStateHolder.publishEventToUsers([balance.userId], balanceUpdated);
    }

    public async publishUserStartedTyping(userStartedTyping: UserStartedTyping) {
        const event: WebsocketEvent<UserStartedTyping> = {
            payload: userStartedTyping,
            type: EventType.USER_STARTED_TYPING
        };
        await Promise.all([
            this.connectionsStateHolder.publishEventToChatParticipants(userStartedTyping.chatId, event),
            this.connectionsStateHolder.publishEventToUsersSubscribedToChat(userStartedTyping.chatId, event)
        ]);
    }
}
