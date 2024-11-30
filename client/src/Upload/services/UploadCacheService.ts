import {UploadedFileContainer} from "../../utils/file-utils";
import {UploadType} from "../../api/types/response";

const FILES = "files-cache";
const LOCAL_FILES = "local-files-cache";

export class UploadCacheService {

	public async saveLocalFileToCache(file: UploadedFileContainer): Promise<void> {
		if (!file.file) {
			return;
		}

		try {
			const cache = await caches.open(LOCAL_FILES);
			await cache.put(
				this.createLocalFileRequest(file.localId, file.expectedUploadType),
				new Response(file.file)
			);
		} catch (error) {
			console.error("Error when saving local file to cache", error);
		}
	}

	public async saveFileToCache(file: UploadedFileContainer): Promise<void> {
		if (!file.file || !file.uploadedFile) {
			return ;
		}

		try {
			const cache = await caches.open(FILES);
			await cache.put(
				this.createFileRequest(file.uploadedFile.id, file.uploadedFile.type),
				new Response(file.file)
			);
		} catch (error) {
			console.log("Error when saving file to cache", error);
		}
	}

	public async getLocalFileFromCache(localId: string, uploadType: UploadType): Promise<Blob | undefined> {
		const cache = await caches.open(LOCAL_FILES);
		const response = await cache.match(this.createLocalFileRequest(localId, uploadType));
		return response?.blob();
	}

	public async getFileFromCache(fileId: string, uploadType: UploadType): Promise<Blob | undefined> {
		const cache = await caches.open(FILES);
		const response = await cache.match(this.createFileRequest(fileId, uploadType));
		return response?.blob();
	}

	public async deleteLocalFileFromCache(localId: string, uploadType: UploadType): Promise<void> {
		try {
			const cache = await caches.open(LOCAL_FILES);
			await cache.delete(this.createLocalFileRequest(localId, uploadType));
		} catch (error) {
			console.error(error);
		}
	}

	public async deleteFileFromCache(fileId: string, uploadType: UploadType): Promise<void> {
		const cache = await caches.open(FILES);
		await cache.delete(this.createFileRequest(fileId, uploadType));
	}

	private createLocalFileRequest(localId: string, uploadType: UploadType): Request {
		return new Request(this.createLocalFileUrl(localId, uploadType));
	}

	private createFileRequest(fileId: string, uploadType: UploadType): Request {
		return new Request(this.createFileUrl(fileId, uploadType));
	}

	private createLocalFileUrl(localId: string, uploadType: UploadType): URL {
		return new URL(`http://${LOCAL_FILES}/${uploadType}/${localId}`);
	}

	private createFileUrl(fileId: string, uploadType: UploadType): URL {
		return new URL(`http://${FILES}/${uploadType}/${fileId}`);
	}

	public async deleteAllLocalFiles(): Promise<void> {
		await caches.delete(LOCAL_FILES);
	}

	public async deleteAllFiles(): Promise<void> {
		await caches.delete(FILES);
	}
}