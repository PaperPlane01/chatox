import {connect, Socket, SocketOptions, ManagerOptions} from "socket.io-client";
import {WebsocketEvent, WebsocketEventType} from "../api/types/websocket";

export class SocketIoWorker {
    private socketIoClient?: Socket = undefined

    connect = (url: string, options: Partial<ManagerOptions & SocketOptions>): void => {
        console.log("connecting!")

        if (this.socketIoClient) {
            this.socketIoClient.disconnect();
        }

        this.socketIoClient = connect(url, options);
    }

    isConnected = (): boolean => {
        return this.socketIoClient !== undefined;
    }

    registerEventHandler = <T>(eventType: WebsocketEventType, handler: (event: WebsocketEvent<T>) => void): void => {
        if (this.socketIoClient) {
            console.log(`Registering handler for event ${eventType}`)
            console.log(handler);
            this.socketIoClient.on(eventType, (event: WebsocketEvent<any>) => {
                console.log("Calling back to main with event " + eventType);
                handler(event);
            });
        }
    }
}
