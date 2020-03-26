import {action, computed, reaction} from "mobx";
import SocketIo from "socket.io-client";
import {AuthorizationStore} from "../../Authorization/stores";
import {EntitiesStore} from "../../entities-store";
import {WebsocketEvent, WebsocketEventType} from "../../api/types/websocket";
import {Message} from "../../api/types/response";

export class WebsocketStore {
    socketIoClient?: SocketIOClient.Socket;

    @computed
    get refreshingToken(): boolean {
        return this.authorization.refreshingToken;
    }

    constructor(private readonly authorization: AuthorizationStore,
                private readonly entities: EntitiesStore) {

        reaction(
            () => authorization.currentUser,
            () => this.startListening()
        )
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
    };

    @action
    subscribeToEvents = () => {
        if (this.socketIoClient) {
            this.socketIoClient.on(
                WebsocketEventType.MESSAGE_CREATED,
                (event: WebsocketEvent<Message>) => {
                    const message = event.payload;
                    message.previousMessageId = this.entities.chats.findById(message.chatId).lastMessage;
                    this.entities.insertMessage(message);
                }
            );
            this.socketIoClient.on(
                WebsocketEventType.MESSAGE_UPDATED,
                (event: WebsocketEvent<Message>) => this.entities.insertMessage(event.payload)
            );
        }
    };

    @action
    subscribeToChat = (chatId: string) => {
        if (this.socketIoClient) {
            this.socketIoClient.emit(WebsocketEventType.CHAT_SUBSCRIPTION, {chatId});
        }
    };

    @action
    unsubscribeFromChat = (chatId: string) => {
        if (this.socketIoClient) {
            this.socketIoClient.emit(WebsocketEventType.CHAT_UNSUBSCRIPTION, {chatId});
        }
    }
}
