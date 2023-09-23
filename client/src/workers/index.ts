import {connect, Socket, SocketOptions, ManagerOptions} from "socket.io-client";
import {WebsocketEvent, WebsocketEventType} from "../api/types/websocket";

let socketIoClient: Socket | undefined = undefined;

interface SocketIoWorkerBase {
    connect: (url: string, options: Partial<ManagerOptions & SocketOptions>) => void,
    isConnected: () => boolean,
    registerEventHandler: <T>(eventType: WebsocketEventType, handler: (event: WebsocketEvent<T>) => void) => void,
    disconnect: () => void,
    emitEvent: (eventType: WebsocketEventType, args: object) => void
}

export interface ISocketIoWorker extends SocketIoWorkerBase {
    [key: string]: (...any: any[]) => void
}

export class SocketIoWorker implements SocketIoWorkerBase {

    connect = (url: string, options: Partial<ManagerOptions & SocketOptions>): void => {
        console.log("connecting!")

        if (socketIoClient) {
            console.log("Already connected");
            return;
        }

        socketIoClient = connect(url, options);
    }

    isConnected = (): boolean => {
        console.log("connected? " + socketIoClient !== undefined);
        return socketIoClient !== undefined;
    }

    registerEventHandler = <T>(eventType: WebsocketEventType, handler: (event: WebsocketEvent<T>) => void): void => {
        if (socketIoClient) {
            console.log("registering event handler")
            socketIoClient.on(eventType, (event: WebsocketEvent<any>) => {
                handler(event);
            });
        }
    }

    disconnect = (): void => {
        if (socketIoClient) {
            socketIoClient.disconnect();
        }

        socketIoClient = undefined;
    }

    emitEvent = (eventType: WebsocketEventType, args: object): void => {
        if (socketIoClient) {
            socketIoClient.emit(eventType, args);
        }
    }
}
