import {ManagerOptions, Socket, SocketOptions, connect} from "socket.io-client";
import {WebsocketEvent, WebsocketEventType} from "../api/types/websocket";

let socketIoClient: Socket | undefined = undefined;

export class SocketIoWorker {

	connect = (url: string, options: Partial<ManagerOptions & SocketOptions>): void => {
		console.log("Connecting to Socket IO from worker")

		if (socketIoClient) {
			console.log("Connection already established");
			return;
		}

		socketIoClient = connect(url, options);
	}

	isConnected = (): boolean => {
		console.log(`isConnected() result ${socketIoClient !== undefined}`);
		return socketIoClient !== undefined;
	}

	registerEventHandler = <T>(eventType: WebsocketEventType, handler: (event: WebsocketEvent<T>) => void): void => {
		if (socketIoClient) {
			console.log(`Registering handler for event ${eventType}`)
			socketIoClient.on(eventType, (event: WebsocketEvent<any>) => {
				handler(event);
			});
		}
	}

	disconnect = (): void => {
		console.log("Disconnecting from Socket IO from worker")

		if (socketIoClient) {
			socketIoClient.disconnect();
		}

		socketIoClient = undefined;
	}

	emitEvent = (eventType: WebsocketEventType, args: object): void => {
		console.log(`Emitting event ${eventType}`);

		if (socketIoClient) {
			socketIoClient.emit(eventType, args);
		}
	}
}