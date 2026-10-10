import {ForbiddenException, forwardRef, Inject} from "@nestjs/common";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway
} from "@nestjs/websockets";
import {AmqpConnection} from "@golevelup/nestjs-rabbitmq";
import {Socket} from "socket.io";
import {
    ChatSubscription,
    ChatUnsubscription,
    DraftMessageDeleted,
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
import {
    ChatNotificationsSettings,
    ChatNotificationsSettingsDeleted,
    ChatNotificationsSettingsUpdated,
    GlobalNotificationsSettingsUpdated
} from "../notifications-settings";
import {MessageReactionAdded, MessageReactionDeleted} from "../message-reactions/types/events";

@WebSocketGateway({
    path: "/api/v1/events/",
    transports: [
        "websocket",
        "polling"
    ]
})
export class WebsocketEventsPublisher implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly log = LoggerFactory.getLogger(WebsocketEventsPublisher);

    constructor(private readonly amqpConnection: AmqpConnection,
                private readonly connectionsStateHolder: WebsocketConnectionsStateHolder,
                @Inject(forwardRef(() => ChatsService)) private readonly chatsService: ChatsService) {
    }

    afterInit(server: any): void {
        this.connectionsStateHolder.setServer(server);
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
            );
        }
    }

    public handleDisconnect(client: Socket): void {
        this.connectionsStateHolder.handleDisconnect(client)
            .then(({noMoreConnections, userId}) => {
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
            });
    }

    public isSessionActive(socketIoId: string): SessionActivityStatusResponse {
        const active = this.connectionsStateHolder.isSocketActive(socketIoId);
        return {active};
    }

    public async getSessionsOfUser(userId: string): Promise<string[]> {
        return await this.connectionsStateHolder.getSocketIdsOfUser(userId);
    }

    @SubscribeMessage(EventType.CHAT_SUBSCRIPTION)
    public async handleChatSubscription(@MessageBody() message: WebsocketEvent<ChatSubscription>,
                                        @ConnectedSocket() client: Socket): Promise<void> {
        const chatId = message.payload.chatId;
        const chat = await this.chatsService.findPrivateChatById(chatId);

        if (chat) {
            throw new ForbiddenException("Subscriptions to private chats is prohibited");
        }

        this.connectionsStateHolder.addSocketToChat(client, chatId);
    }

    @SubscribeMessage(EventType.CHAT_UNSUBSCRIPTION)
    public handleChatUnsubscription(@MessageBody() message: WebsocketEvent<ChatUnsubscription>,
                                    @ConnectedSocket() client: Socket): void {
        this.connectionsStateHolder.removeSocketFromChat(client, message.payload.chatId);
    }

    public async publishMessageCreated(message: ChatMessage) {
        const messageCreatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_CREATED,
            payload: message
        };
        this.log.debug("Publishing new message");
        this.connectionsStateHolder.publishEventToChat(message.chatId, messageCreatedEvent);
    }

    public async publishMessageUpdated(message: ChatMessage) {
        const messageUpdatedEvent: WebsocketEvent<ChatMessage> = {
            type: EventType.MESSAGE_UPDATED,
            payload: message
        };
        this.connectionsStateHolder.publishEventToChat(message.chatId, messageUpdatedEvent);
    }

    public async publishMessageDeleted(messageDeleted: MessageDeleted) {
        const messageDeletedEvent: WebsocketEvent<MessageDeleted> = {
            type: EventType.MESSAGE_DELETED,
            payload: messageDeleted
        };
        this.connectionsStateHolder.publishEventToChat(messageDeleted.chatId, messageDeletedEvent);
    }

    public async publishMessagesDeleted(messagesDeleted: MessagesDeleted) {
        const messagesDeletedEvent: WebsocketEvent<MessagesDeleted> = {
            type: EventType.MESSAGES_DELETED,
            payload: messagesDeleted
        };
        this.connectionsStateHolder.publishEventToChat(messagesDeleted.chatId, messagesDeletedEvent);
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
        this.connectionsStateHolder.publishEventToChat(createChatParticipationDto.chatId, userJoinedEvent);
        await this.connectionsStateHolder.addUserToChat(createChatParticipationDto.user.id, createChatParticipationDto.chatId);
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
        await this.connectionsStateHolder.removeUserFromChat(userLeftChat.userId, userLeftChat.chatId);
        this.connectionsStateHolder.publishEventToChat(userLeftChat.chatId, userLeftEvent);
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
        await this.connectionsStateHolder.removeUserFromChat(userKickedFromChat.userId, userKickedFromChat.chatId);
        this.connectionsStateHolder.publishEventToChat(userKickedFromChat.chatId, userKickedEvent);
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
            this.connectionsStateHolder.publishEventToChat(participant.chatId, chatParticipantWentOnline);
        })
    }

    public async publishChatParticipantsWentOffline(chatParticipants: ChatParticipationDto[]) {
        chatParticipants.forEach(participant => {
            const chatParticipantWentOffline: WebsocketEvent<ChatParticipationDto> = {
                payload: participant,
                type: EventType.CHAT_PARTICIPANT_WENT_OFFLINE
            };
            this.connectionsStateHolder.publishEventToChat(participant.chatId, chatParticipantWentOffline);
        })
    }

    public async publishChatParticipantUpdated(chatParticipant: ChatParticipationDto) {
        const chatParticipantUpdated: WebsocketEvent<ChatParticipationDto> = {
            payload: chatParticipant,
            type: EventType.CHAT_PARTICIPANT_UPDATED
        };
        this.connectionsStateHolder.publishEventToChat(chatParticipant.chatId, chatParticipantUpdated);
    }

    public async publishChatUpdated(chat: Chat) {
        const chatUpdated: WebsocketEvent<Chat> = {
            payload: chat,
            type: EventType.CHAT_UPDATED
        };
        this.connectionsStateHolder.publishEventToChat(chat.id, chatUpdated);
    }

    public async publishChatDeleted(chatDeleted: ChatDeleted) {
        const chatDeletedEvent: WebsocketEvent<ChatDeleted> = {
            payload: chatDeleted,
            type: EventType.CHAT_DELETED
        };
        this.connectionsStateHolder.publishEventToChat(chatDeleted.id, chatDeletedEvent);
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
        this.connectionsStateHolder.publishEventToChat(message.chatId, messagePinnedEvent);
    }

    public async publishMessageUnpinned(message: ChatMessage) {
        const messageUnpinnedEvent: WebsocketEvent<ChatMessage> = {
            payload: message,
            type: EventType.MESSAGE_UNPINNED
        };
        this.connectionsStateHolder.publishEventToChat(message.chatId, messageUnpinnedEvent);
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
        this.connectionsStateHolder.publishEventToChat(chatRole.chatId, chatRoleCreated);
    }

    public async publishChatRoleUpdated(chatRole: ChatRoleResponse) {
        const chatRoleUpdated: WebsocketEvent<ChatRoleResponse> = {
            payload: chatRole,
            type: EventType.CHAT_ROLE_UPDATED
        };
        this.connectionsStateHolder.publishEventToChat(chatRole.chatId, chatRoleUpdated);
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
        this.connectionsStateHolder.publishEventToChat(userStartedTyping.chatId, event);
    }

    public async publishChatNotificationsSettingsUpdated(chatNotificationsSettingsUpdated: ChatNotificationsSettingsUpdated) {
        const event: WebsocketEvent<ChatNotificationsSettings> = {
            payload: chatNotificationsSettingsUpdated.notificationsSettings,
            type: EventType.CHAT_NOTIFICATIONS_SETTINGS_UPDATED
        };
        await this.connectionsStateHolder.publishEventToUsers(
            [chatNotificationsSettingsUpdated.userId],
            event
        );
    }

    public async publishChatNotificationsSettingsDeleted(chatNotificationsSettingsDeleted: ChatNotificationsSettingsDeleted) {
        const payload: Omit<ChatNotificationsSettingsDeleted, "userId"> = {
            chatId: chatNotificationsSettingsDeleted.chatId
        };
        const event: WebsocketEvent<typeof payload> = {
            payload,
            type: EventType.CHAT_NOTIFICATIONS_SETTINGS_DELETED
        };
        await this.connectionsStateHolder.publishEventToUsers(
            [chatNotificationsSettingsDeleted.userId],
            event
        );
    }

    public async publishGlobalNotificationsSettingsUpdated(globalNotificationsSettingsUpdated: GlobalNotificationsSettingsUpdated) {
        const payload: Omit<GlobalNotificationsSettingsUpdated, "userId"> = {
            dialogChatSettings: globalNotificationsSettingsUpdated.dialogChatSettings,
            groupChatSettings: globalNotificationsSettingsUpdated.dialogChatSettings
        };
        const event: WebsocketEvent<typeof payload> = {
            payload,
            type: EventType.GLOBAL_NOTIFICATIONS_SETTINGS_UPDATED
        };
        await this.connectionsStateHolder.publishEventToUsers(
            [globalNotificationsSettingsUpdated.userId],
            event
        );
    }

    public async publishDraftMessageCreated(message: ChatMessage): Promise<void> {
        const event: WebsocketEvent<ChatMessage> = {
            type: EventType.DRAFT_MESSAGE_CREATED,
            payload: message
        };
        await this.connectionsStateHolder.publishEventToUsers([message.sender.id], event);
    }

    public async publishDraftMessageUpdated(message: ChatMessage): Promise<void> {
        const event: WebsocketEvent<ChatMessage> = {
            type: EventType.DRAFT_MESSAGE_UPDATED,
            payload: message
        };
        await this.connectionsStateHolder.publishEventToUsers([message.sender.id], event);
    }

    public async publishDraftMessageDeleted(draftMessageDeleted: DraftMessageDeleted): Promise<void> {
        const event: WebsocketEvent<Omit<DraftMessageDeleted, "senderId">> = {
            type: EventType.DRAFT_MESSAGE_DELETED,
            payload: {
                chatId: draftMessageDeleted.chatId,
                draftMessageId: draftMessageDeleted.draftMessageId
            }
        };
        await this.connectionsStateHolder.publishEventToUsers([draftMessageDeleted.senderId], event);
    }

    public async publishMessageReactionAdded(messageReactionAdded: MessageReactionAdded): Promise<void> {
        const event: WebsocketEvent<MessageReactionAdded> = {
            type: EventType.MESSAGE_REACTION_ADDED,
            payload: messageReactionAdded
        };
        this.connectionsStateHolder.publishEventToChat(messageReactionAdded.chatId, event);
    }

    public async publishMessageReactionDeleted(messageReactionDeleted: MessageReactionDeleted): Promise<void> {
        const event: WebsocketEvent<MessageReactionDeleted> = {
            type: EventType.MESSAGE_REACTION_DELETED,
            payload: messageReactionDeleted
        };
        this.connectionsStateHolder.publishEventToChat(messageReactionDeleted.chatId, event);
    }
}
