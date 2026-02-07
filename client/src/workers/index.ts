import {Remote} from "comlink";
import type {SocketIoWorker as InternalSocketIoWorker} from "./SocketIoWorker";
import type {DotLottieZipWorker as InternalDotLottieZipWorker} from "./DotLottieZipWorker";
import type {ZipStickerPackImportWorker as InternalZipStickerPackImportWorker} from "./ZipStickerPackImportWorker";

export type SocketIoWorker = InternalSocketIoWorker;
export type DotLottieZipWorker = InternalDotLottieZipWorker;
export type ZipStickerPackImportWorker = InternalZipStickerPackImportWorker;

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

	console.log(socketIoWorkerInstance);

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

let zipStickerPackImportWorkerInstance: Remote<ZipStickerPackImportWorker> | undefined = undefined;

export const getStickerPackImportWorker = async (): Promise<Remote<ZipStickerPackImportWorker> | undefined> => {
	if (zipStickerPackImportWorkerInstance) {
		return zipStickerPackImportWorkerInstance;
	}

	if (!window?.Worker) {
		return undefined;
	}

	const WorkerModule = new ComlinkWorker<typeof import("./ZipStickerPackImportWorker")>(
		new URL("./ZipStickerPackImportWorker", import.meta.url),
		{
			type: "module",
			name: "zip-sticker-pack-import-worker"
		}
	);

	zipStickerPackImportWorkerInstance = await new WorkerModule.ZipStickerPackImportWorker();

	return zipStickerPackImportWorkerInstance;
};
