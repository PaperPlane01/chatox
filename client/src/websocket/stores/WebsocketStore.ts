import {makeAutoObservable, reaction, runInAction} from "mobx";
import {connect, Socket} from "socket.io-client";
import {proxy, Remote} from "comlink";
import {isBefore} from "date-fns";
import {AuthorizationStore} from "../../Authorization";
import {EntitiesStore} from "../../entities-store";
import {ChatApi} from "../../api";
import {
    BalanceUpdated,
    ChatDeleted,
    ChatUpdated,
    MessageDeleted,
    MessageRead,
    MessagesDeleted,
    PrivateChatCreated,
    UserKickedFromChat,
    UserLeftChat,
    UserStartedTyping,
    WebsocketEvent,
    WebsocketEventType
} from "../../api/types/websocket";
import {ChatBlocking, ChatParticipation, ChatRole, CurrentUser, GlobalBan, Message} from "../../api/types/response";
import {
    ChatOfCurrentUserEntity,
    ChatsPreferencesStore,
    ChatStore,
    PendingChatsOfCurrentUserStore,
    TypingUsersStore
} from "../../Chat";
import {MarkMessageReadStore, MessagesListScrollPositionsStore, MessagesOfChatStore} from "../../Message";
import {BalanceStore} from "../../Balance";
import {LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";
import {getSocketIoWorker, SocketIoWorker} from "../../workers";
import {isDefined} from "../../utils/object-utils";
import {SoundNotificationStore} from "../../Notification";

type ConnectionType = "socketIo" | "sharedWorker";

let pendingEvents: Array<[WebsocketEventType, object]> = [];

export class WebsocketStore {
    socketIoClient?: Socket = undefined;

    socketIoWorker?: Remote<SocketIoWorker> = undefined;

    connectionType: ConnectionType = "socketIo";

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly authorization: AuthorizationStore,
                private readonly entities: EntitiesStore,
                private readonly chatStore: ChatStore,
                private readonly messagesOfChatStore: MessagesOfChatStore,
                private readonly scrollPositionStore: MessagesListScrollPositionsStore,
                private readonly markMessageReadStore: MarkMessageReadStore,
                private readonly balanceStore: BalanceStore,
                private readonly chatPreferences: ChatsPreferencesStore,
                private readonly typingUsersStore: TypingUsersStore,
                private readonly pendingChats: PendingChatsOfCurrentUserStore,
                private readonly locale: LocaleStore,
                private readonly soundNotification: SoundNotificationStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);

        reaction(
            () => this.currentUser?.id,
            () => this.startListening()
        );
    }

    startListening = (): void => {
        if (this.chatPreferences.useSharedWorker && window.SharedWorker) {
            this.startListeningWithSharedWorker().then(success => {
                if (!success) {
                    console.log("Falling back to default socket io connection");
                    this.startListeningWithSocketIo();
                }
            })
        } else {
            this.startListeningWithSocketIo();
        }
    }

    startListeningWithSharedWorker = async (): Promise<boolean> => {
        if (this.socketIoWorker) {
            await this.socketIoWorker.disconnect();
        } else {
            const worker = await getSocketIoWorker();
            runInAction(() => this.socketIoWorker = worker);
        }

        if (!this.socketIoWorker) {
            console.error("Unable to initialize socket io worker")
            return false;
        }

        if (!await this.socketIoWorker.isConnected()) {
            const accessToken = localStorage.getItem("accessToken");
            const url = accessToken
                ? `${import.meta.env.VITE_API_BASE_URL}?accessToken=${accessToken}`
                : import.meta.env.VITE_API_BASE_URL;

            console.log("Connecting to socket io with worker");

            await this.socketIoWorker.connect(url, {
                path: "/api/v1/events",
                transports: ["websocket"]
            });
        }

        const handlers = this.createHandlers();

        for (const [eventType, handler] of handlers) {
            await this.socketIoWorker.registerEventHandler(eventType, proxy(handler))
        }

        this.setConnectionType("sharedWorker");

        await this.emitPendingEvents();

        return true;
    }

    private setConnectionType = (connectionType: ConnectionType): void => {
        this.connectionType = connectionType;
    }

    startListeningWithSocketIo = (): void => {
        if (this.socketIoClient) {
            this.socketIoClient.disconnect();
        }

        if (localStorage.getItem("accessToken")) {
            this.socketIoClient = connect(`${import.meta.env.VITE_API_BASE_URL}?accessToken=${localStorage.getItem("accessToken")}`, {
                path: "/api/v1/events",
                transports: ["websocket"]
            });
        } else {
            this.socketIoClient = connect(import.meta.env.VITE_API_BASE_URL, {
                path: "/api/v1/events",
                transports: ["websocket"]
            });
        }

        this.subscribeSocketIoToEvents();

        this.setConnectionType("socketIo");

        this.emitPendingEvents();
    }

    private subscribeSocketIoToEvents = (): void => {
        if (!this.socketIoClient) {
            return;
        }

        const eventHandlers = this.createHandlers();

        for (let [event, handler] of eventHandlers) {
            this.socketIoClient.on(event, handler);
        }

        this.connectionType = "socketIo";
    }

    private emitPendingEvents = async (): Promise<void> => {
        if (pendingEvents.length !== 0) {
            for (const [eventType, args] of pendingEvents) {
                await this.emitWebsocketEvent(eventType, args);
            }
        }

        pendingEvents = [];
    }
    
    private createHandlers(): Map<WebsocketEventType, (websocketEvent: WebsocketEvent<any>) => void> {
        const map = new  Map<WebsocketEventType, (websocketEvent: WebsocketEvent<any>) => void>();
        map.set(
            WebsocketEventType.MESSAGE_CREATED,
            (event: WebsocketEvent<Message>) => this.handleNewMessage(event.payload)
        );
        map.set(
            WebsocketEventType.MESSAGE_UPDATED,
            (event: WebsocketEvent<Message>) => {
                this.entities.messages.insert(event.payload);
            }
        );
        map.set(
            WebsocketEventType.MESSAGES_DELETED,
            (event: WebsocketEvent<MessagesDeleted>) => {
                this.entities.messages.deleteAllById(event.payload.messagesIds);
            }
        );
        map.set(
            WebsocketEventType.CHAT_BLOCKING_CREATED,
            (event: WebsocketEvent<ChatBlocking>) => this.entities.chatBlockings.insert(event.payload)
        );
        map.set(
            WebsocketEventType.CHAT_BLOCKING_UPDATED,
            (event: WebsocketEvent<ChatBlocking>) => this.entities.chatBlockings.insert(event.payload)
        );
        map.set(
            WebsocketEventType.CHAT_BLOCKING_CANCELED,
            (event: WebsocketEvent<ChatBlocking>) => this.entities.chatBlockings.insert(event.payload)
        );
        map.set(
            WebsocketEventType.CHAT_PARTICIPANT_WENT_ONLINE,
            (event: WebsocketEvent<ChatParticipation>) => this.entities.chatParticipations.insert(event.payload)
        );
        map.set(
            WebsocketEventType.CHAT_PARTICIPANT_WENT_OFFLINE,
            (event: WebsocketEvent<ChatParticipation>) => this.entities.chatParticipations.insert(event.payload)
        );
        map.set(
            WebsocketEventType.CHAT_UPDATED,
            (event: WebsocketEvent<ChatUpdated>) => this.entities.chats.onChatUpdated(event.payload)
        );
        map.set(
            WebsocketEventType.MESSAGE_DELETED,
            (event: WebsocketEvent<MessageDeleted>) => this.entities.messages.deleteById(event.payload.messageId)
        );
        map.set(
            WebsocketEventType.USER_KICKED_FROM_CHAT,
            (event: WebsocketEvent<UserKickedFromChat>) => this.entities.chatParticipations.deleteById(
                event.payload.chatParticipationId,
                {decreaseChatParticipantsCount: true}
            )
        );
        map.set(
            WebsocketEventType.USER_LEFT_CHAT,
            (event: WebsocketEvent<UserLeftChat>) => this.entities.chatParticipations.deleteById(
                event.payload.chatParticipationId,
                {decreaseChatParticipantsCount: true}
            )
        );
        map.set(
            WebsocketEventType.CHAT_DELETED,
            (event: WebsocketEvent<ChatDeleted>) => this.entities.chats.deleteById(
                event.payload.id,
                {
                    deletionReason: event.payload.reason,
                    deletionComment: event.payload.comment
                }
            )
        );
        map.set(
            WebsocketEventType.GLOBAL_BAN_CREATED,
            (event: WebsocketEvent<GlobalBan>) => this.processGlobalBan(event.payload)
        );
        map.set(
            WebsocketEventType.GLOBAL_BAN_UPDATED,
            (event: WebsocketEvent<GlobalBan>) => this.processGlobalBan(event.payload)
        );
        map.set(
            WebsocketEventType.MESSAGE_PINNED,
            (event: WebsocketEvent<Message>) => this.entities.messages.insert(event.payload)
        );
        map.set(
            WebsocketEventType.MESSAGE_UNPINNED,
            (event: WebsocketEvent<Message>) => {
                const chat = this.entities.chats.findByIdOptional(event.payload.chatId);

                if (chat && !event.payload.pinnedAt) {
                    this.entities.messages.insert(event.payload);
                    chat.pinnedMessageId = undefined;
                    this.entities.chats.insertEntity(chat);
                }
            }
        );
        map.set(
            WebsocketEventType.SCHEDULED_MESSAGE_CREATED,
            (event: WebsocketEvent<Message>) => this.entities.scheduledMessages.insert(event.payload)
        );
        map.set(
            WebsocketEventType.SCHEDULED_MESSAGE_PUBLISHED,
            (event: WebsocketEvent<Message>) => this.entities.chats.removeScheduledMessageFromChat(
                event.payload.chatId,
                event.payload.id
            )
        );
        map.set(
            WebsocketEventType.SCHEDULED_MESSAGE_DELETED,
            (event: WebsocketEvent<MessageDeleted>) => this.entities.chats.removeScheduledMessageFromChat(
                event.payload.chatId,
                event.payload.messageId
            )
        );
        map.set(
            WebsocketEventType.MESSAGE_READ,
            (event: WebsocketEvent<MessageRead>) => this.handleMessageRead(event.payload)
        );
        map.set(
            WebsocketEventType.PRIVATE_CHAT_CREATED,
            (event: WebsocketEvent<PrivateChatCreated>) => this.entities.chats.onPrivateChatCreated(event.payload)
        );
        map.set(
            WebsocketEventType.CHAT_ROLE_CREATED,
            (event: WebsocketEvent<ChatRole>) => this.entities.chatRoles.insert(event.payload)
        );
        map.set(
            WebsocketEventType.CHAT_ROLE_UPDATED,
            (event: WebsocketEvent<ChatRole>) => this.entities.chatRoles.insert(event.payload)
        );
        map.set(
            WebsocketEventType.CHAT_PARTICIPANT_UPDATED,
            (event: WebsocketEvent<ChatParticipation>) => this.entities.chatParticipations.insert(event.payload)
        );
        map.set(
            WebsocketEventType.BALANCE_UPDATED,
            (event: WebsocketEvent<BalanceUpdated>) => this.balanceStore.updateBalance(
                event.payload.currency,
                event.payload.amount
            )
        );
        map.set(
            WebsocketEventType.USER_STARTED_TYPING,
            (event: WebsocketEvent<UserStartedTyping>) => this.typingUsersStore.onUserStartedTyping(event.payload)
        );
        map.set(
            WebsocketEventType.USER_JOINED_CHAT,
            (event: WebsocketEvent<ChatParticipation>) => this.handleUserJoinChat(event.payload)
        );
        
        return map;
    }

    private handleNewMessage(message: Message): void {
        message.previousMessageId = this.entities.chats.findById(message.chatId).lastMessage;
        const messageEntity = this.entities.messages.insert({
            ...message,
            readByCurrentUser: false
        });

        if (this.authorization.currentUser) {
            if (this.authorization.currentUser.id !== message.sender.id) {
                this.typingUsersStore.removeTypingUser(message.chatId, message.sender.id, true);
                const currentUserMentioned = messageEntity.mentionedUsers
                    .includes(this.authorization.currentUser.id);

                if (this.chatStore.selectedChatId === message.chatId) {
                    if (this.scrollPositionStore.getReachedBottom(message.chatId)) {
                        this.markMessageReadStore.markMessageRead(message.id);
                    } else {
                        this.entities.chats.increaseUnreadMessagesCountOfChat(
                            message.chatId,
                            currentUserMentioned
                        );
                    }
                } else {
                    this.entities.chats.increaseUnreadMessagesCountOfChat(
                        message.chatId,
                        currentUserMentioned
                    );
                }
            }
        }

        this.soundNotification.playSoundForMessage(messageEntity);
    }

    private processGlobalBan(globalBan: GlobalBan): void {
        this.entities.globalBans.insert(globalBan);

        if (this.authorization.currentUser && globalBan.bannedUser.id === this.authorization.currentUser.id) {
            this.authorization.setCurrentUser({
                ...this.authorization.currentUser,
                globalBan
            });
        }
    }

    private handleUserJoinChat = async (chatParticipation: ChatParticipation): Promise<void> => {
        const chat = await this.getChat(chatParticipation.chatId);

        if (!chat) {
            return;
        }

        this.entities.chatParticipations.insert(chatParticipation, {increaseChatParticipantsCount: true});
        this.entities.chats.insertEntity({
            ...chat,
            currentUserParticipationId: chatParticipation.id
        });

        if (!chat.lastMessage) {
            this.messagesOfChatStore.fetchMessages({
                abortIfInitiallyFetched: true,
                chatId: chat.id,
                skipSettingLastMessage: false
            });
        }

        const wasPending = this.pendingChats.chatsIds.includes(chat.id);

        if (wasPending) {
            this.pendingChats.removeChatId(chat.id);
            this.snackbarService.enqueueSnackbar(
                this.locale.getCurrentLanguageLabel("chat.join.request.approved", {chatName: chat.name})
            );
        }
    }

    private getChat = async (chatId: string): Promise<ChatOfCurrentUserEntity | undefined> => {
        const chat = this.entities.chats.findByIdOptional(chatId);

        if (chat) {
            return chat;
        } else {
            try {
                const {data} = await ChatApi.findChatByIdOrSlug(chatId);

                return this.entities.chats.insert({
                    ...data,
                    unreadMessagesCount: 0,
                    unreadMentionsCount: 0,
                    deleted: false
                });
            } catch (error) {
                console.log("Error when retrieving chat!");
                console.log(error);
                return undefined;
            }
        }
    }

    private handleMessageRead = (messageRead: MessageRead): void => {
        const message = this.entities.messages.findByIdOptional(messageRead.messageId);
        const chat = this.entities.chats.findByIdOptional(messageRead.chatId);

        if (!message || !chat) {
            return;
        }

        message.readByAnyone = true;
        this.entities.messages.insertEntity(message);


        if (!isDefined(chat.lastMessageReadByAnyoneCreatedAt)
            || isBefore(chat.lastMessageReadByAnyoneCreatedAt, message.createdAt)) {
            chat.lastMessageReadByAnyoneCreatedAt = message.createdAt
            this.entities.chats.insertEntity(chat);
        }
    }

    subscribeToChat = (chatId: string) => {
        this.emitWebsocketEvent(WebsocketEventType.CHAT_SUBSCRIPTION, {chatId});
    }

    unsubscribeFromChat = (chatId: string) => {
       this.emitWebsocketEvent(WebsocketEventType.CHAT_UNSUBSCRIPTION, {chatId});
    }

    private emitWebsocketEvent = async (eventType: WebsocketEventType, args: object): Promise<void> => {
        switch (this.connectionType) {
            case "sharedWorker":
                if (this.socketIoWorker) {
                    await this.socketIoWorker.emitEvent(eventType, args);
                } else {
                    this.addEventToQueue(eventType, args);
                }
                break;
            case "socketIo":
            default:
                if (this.socketIoClient) {
                    this.socketIoClient.emit(eventType, args);
                } else {
                    this.addEventToQueue(eventType, args);
                }
                break;
        }
    }

    private addEventToQueue = (eventType: WebsocketEventType, args: object) => {
        pendingEvents.push([eventType, args]);
    }
}
