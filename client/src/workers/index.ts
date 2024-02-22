import {Remote} from "comlink";
import {SocketIoWorker as InternalSocketIoWorker} from "./SocketIoWorker";

export type SocketIoWorker = InternalSocketIoWorker;

let socketIoWorkerInstance: Remote<SocketIoWorker> | undefined;

export const getSocketIoWorker = async (): Promise<Remote<SocketIoWorker> | undefined> => {
	if (socketIoWorkerInstance) {
		return socketIoWorkerInstance;
	}

	if (!window?.SharedWorker) {
		return undefined;
	}

	const WorkerModule = new ComlinkSharedWorker<typeof import("./SocketIoWorker")>(
		new URL("./SocketIoWorker", import.meta.url),
		{
			type: "module",
			name: "chatox-socket-io-worker"
		}
	);

	socketIoWorkerInstance = await new WorkerModule.SocketIoWorker();

	return socketIoWorkerInstance;
};
