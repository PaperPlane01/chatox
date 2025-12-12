import {Remote} from "comlink";
import type {SocketIoWorker as InternalSocketIoWorker} from "./SocketIoWorker";
import type {DotLottieZipWorker as InternalDotLottieZipWorker} from "./DotLottieZipWorker";

export type SocketIoWorker = InternalSocketIoWorker;
export type DotLottieZipWorker = InternalDotLottieZipWorker;

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

let dotLottieZipWorkerInstance: Remote<DotLottieZipWorker> | undefined = undefined;

export const getDotLottieZipWorker = async (): Promise<Remote<DotLottieZipWorker> | undefined> => {
	if (dotLottieZipWorkerInstance) {
		return dotLottieZipWorkerInstance;
	}

	if (!window?.Worker) {
		return undefined;
	}

	const WorkerModule = new ComlinkWorker<typeof import("./DotLottieZipWorker")>(
		new URL("./DotLottieZipWorker", import.meta.url),
		{
			type: "module",
			name: "chatox-dot-lottie-zip-worker"
		}
	);

	dotLottieZipWorkerInstance = await new WorkerModule.DotLottieZipWorker();

	return dotLottieZipWorkerInstance;
};
