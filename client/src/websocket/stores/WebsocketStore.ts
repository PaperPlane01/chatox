import {action, computed, reaction} from "mobx";
import SocketIo from "socket.io-client";
import {AuthorizationStore} from "../../Authorization";
import {EntitiesStore} from "../../entities-store";
import {
    ChatDeleted,
    ChatUpdated,
    MessageDeleted,
    MessagesDeleted,
    UserKickedFromChat,
    UserLeftChat,
    WebsocketEvent,
    WebsocketEventType
} from "../../api/types/websocket";
import {ChatBlocking, ChatParticipation, GlobalBan, Message} from "../../api/types/response";
import {ChatStore} from "../../Chat";
import {MarkMessageReadStore, MessagesListScrollPositionsStore} from "../../Message";

export class WebsocketStore {
    socketIoClient?: SocketIOClient.Socket;

    @computed
    get refreshingToken(): boolean {
        return this.authorization.refreshingToken;
    }

    constructor(private readonly authorization: AuthorizationStore,
                private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly scrollPositionStore: MessagesListScrollPositionsStore,
                private readonly markMessageReadStore: MarkMessageReadStore) {
        reaction(
            () => authorization.currentUser,
            () => this.startListening()
        );
    }

    @action
    startListening = (): void => {
        if (this.socketIoClient) {
            this.socketIoClient.disconnect();
        }

        if (localStorage.getItem("accessToken")) {
            this.socketIoClient = SocketIo.connect(`${process.env.REACT_APP_API_BASE_URL}?accessToken=${localStorage.getItem("accessToken")}`, {
                path: "/api/v1/events",
                transports: ["websocket"]
            });
        } else {
            this.socketIoClient = SocketIo.connect(`${process.env.REACT_APP_API_BASE_URL}`, {
                path: "/api/v1/events",
                transports: ["websocket"]
            })
        }

        this.subscribeToEvents();
    }

    @action
    subscribeToEvents = () => {
        if (this.socketIoClient) {
            this.socketIoClient.on(
                WebsocketEventType.MESSAGE_CREATED,
                (event: WebsocketEvent<Message>) => {
                    const message = event.payload;
                    message.previousMessageId = this.entities.chats.findById(message.chatId).lastMessage;
                    this.entities.insertMessage({
                        ...message,
                        readByCurrentUser: false
                    });

                    if (this.authorization.currentUser) {
                        if (this.authorization.currentUser.id !== message.sender.id) {
                            if (this.chatStore.selectedChatId === message.chatId) {
                                if (this.scrollPositionStore.getReachedBottom(message.chatId)) {
                                    this.markMessageReadStore.markMessageRead(message.id);
                                } else {
                                    this.entities.chats.increaseUnreadMessagesCountOfChat(message.chatId);
                                }
                            } else {
                                this.entities.chats.increaseUnreadMessagesCountOfChat(message.chatId);
                            }
                        }
                    }
                }
            );
            this.socketIoClient.on(
                WebsocketEventType.MESSAGE_UPDATED,
                (event: WebsocketEvent<Message>) => this.entities.insertMessage(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.MESSAGES_DELETED,
                (event: WebsocketEvent<MessagesDeleted>) => this.entities.messages.deleteAllById(event.payload.messagesIds)
            );
            this.socketIoClient.on(
                WebsocketEventType.CHAT_BLOCKING_CREATED,
                (event: WebsocketEvent<ChatBlocking>) => this.entities.insertChatBlocking(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.CHAT_BLOCKING_UPDATED,
                (event: WebsocketEvent<ChatBlocking>) => this.entities.insertChatBlocking(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.CHAT_BLOCKING_CANCELED,
                (event: WebsocketEvent<ChatBlocking>) => this.entities.insertChatBlocking(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.CHAT_PARTICIPANT_WENT_ONLINE,
                (event: WebsocketEvent<ChatParticipation>) => this.entities.insertChatParticipation(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.CHAT_PARTICIPANT_WENT_OFFLINE,
                (event: WebsocketEvent<ChatParticipation>) => this.entities.insertChatParticipation(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.CHAT_UPDATED,
                (event: WebsocketEvent<ChatUpdated>) => this.entities.updateChat(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.MESSAGE_DELETED,
                (event: WebsocketEvent<MessageDeleted>) => this.entities.messages.deleteById(event.payload.messageId)
            );
            this.socketIoClient.on(
                WebsocketEventType.USER_KICKED_FROM_CHAT,
                (event: WebsocketEvent<UserKickedFromChat>) => this.entities.deleteChatParticipation(
                    event.payload.chatParticipationId,
                    true,
                    event.payload.chatId
                )
            );
            this.socketIoClient.on(
                WebsocketEventType.USER_LEFT_CHAT,
                (event: WebsocketEvent<UserLeftChat>) => this.entities.deleteChatParticipation(
                    event.payload.chatParticipationId,
                    true,
                    event.payload.chatId
                )
            );
            this.socketIoClient.on(
                WebsocketEventType.CHAT_DELETED,
                (event: WebsocketEvent<ChatDeleted>) => this.entities.deleteChat(
                    event.payload.id,
                    event.payload.reason,
                    event.payload.comment
                )
            );
            this.socketIoClient.on(
                WebsocketEventType.GLOBAL_BAN_CREATED,
                (event: WebsocketEvent<GlobalBan>) => this.processGlobalBan(event.payload)

            );
            this.socketIoClient.on(
                WebsocketEventType.GLOBAL_BAN_UPDATED,
                (event: WebsocketEvent<GlobalBan>) => this.processGlobalBan(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.MESSAGE_PINNED,
                (event: WebsocketEvent<Message>) => {
                    const chat = this.entities.chats.findByIdOptional(event.payload.chatId);

                    if (chat && event.payload.pinnedAt) {
                        this.entities.insertMessage(event.payload);
                        chat.pinnedMessageId = event.payload.id;
                        this.entities.chats.insertEntity(chat);
                    }
                }
            );
            this.socketIoClient.on(
                WebsocketEventType.MESSAGE_UNPINNED,
                (event: WebsocketEvent<Message>) => {
                    const chat = this.entities.chats.findByIdOptional(event.payload.chatId);

                    if (chat && !event.payload.pinnedAt) {
                        this.entities.insertMessage(event.payload);
                        chat.pinnedMessageId = undefined;
                        this.entities.chats.insertEntity(chat);
                    }
                }
            );
            this.socketIoClient.on(
                WebsocketEventType.SCHEDULED_MESSAGE_CREATED,
                (event: WebsocketEvent<Message>) => this.entities.insertMessage(event.payload)
            );
            this.socketIoClient.on(
                WebsocketEventType.SCHEDULED_MESSAGE_PUBLISHED,
                (event: WebsocketEvent<Message>) => this.entities.deleteScheduledMessage(event.payload.chatId, event.payload.id)
            );
            this.socketIoClient.on(
                WebsocketEventType.SCHEDULED_MESSAGE_DELETED,
                (event: WebsocketEvent<MessageDeleted>) => this.entities.deleteScheduledMessage(event.payload.chatId, event.payload.messageId)
            );
        }
    }

    @action.bound
    private processGlobalBan(globalBan: GlobalBan): void {
        this.entities.insertGlobalBan(globalBan);

        if (this.authorization.currentUser && globalBan.bannedUser.id === this.authorization.currentUser.id) {
            this.authorization.setCurrentUser({
                ...this.authorization.currentUser,
                globalBan
            });
        }
    }

    @action
    subscribeToChat = (chatId: string) => {
        if (this.socketIoClient) {
            this.socketIoClient.emit(WebsocketEventType.CHAT_SUBSCRIPTION, {chatId});
        }
    }

    @action
    unsubscribeFromChat = (chatId: string) => {
        if (this.socketIoClient) {
            this.socketIoClient.emit(WebsocketEventType.CHAT_UNSUBSCRIPTION, {chatId});
        }
    }
}
