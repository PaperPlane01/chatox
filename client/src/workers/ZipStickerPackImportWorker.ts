import {BlobReader, BlobWriter, ZipReader} from "@zip.js/zip.js";
import {ZipImportFile, ZipImportResponse} from "./types";
import {isDirectoryEntry, isFileEntry} from "./utils";

export class ZipStickerPackImportWorker {

	async loadFiles(
		zipArchive: File,
		acceptedFormats: string[],
		maxSize: number,
		onLengthReceived?: (length: number) => void,
		onFileReadStarted?: (fileName: string) => void,
		onFileReadEnded?: (fileName: string) => void
	): Promise<ZipImportResponse> {
		try {
			const blobReader = new BlobReader(zipArchive);
			const zipReader = new ZipReader(blobReader);
			const entries = await zipReader.getEntries();
			const rootDirectory = entries.find(isDirectoryEntry)
			const files = rootDirectory
				? entries.filter(isFileEntry)
					.filter(entry => entry.filename.startsWith(rootDirectory.filename))
				: entries.filter(isFileEntry);
			onLengthReceived?.(files.length);
			const result: ZipImportFile[] = [];
			const size = Math.min(files.length, maxSize);

			for (let currentFile = 0; currentFile < size; currentFile++) {
				const entry = files[currentFile];
				const fileName = this.removeDirectoryName(rootDirectory?.filename, entry.filename);
				const extension = fileName.substring(fileName.lastIndexOf("."));

				if (!acceptedFormats.includes(extension)) {
					continue;
				}

				onFileReadStarted?.(fileName);
				const blobWriter = new BlobWriter();
				const blob = await entry.getData(blobWriter);
				result.push({
					file: blob,
					filename: fileName
				});
				onFileReadEnded?.(fileName);
			}

			return {
				rootName: rootDirectory?.filename?.replaceAll("/", ""),
				files: result
			};
		} catch (error) {
			console.error("Error occurred when reading files", error);
			throw error;
		}
	}

	private removeDirectoryName(directoryName: string | undefined, fileName: string): string {
		if (directoryName) {
			return fileName.replace(directoryName, "").replaceAll("/", "");
		} else {
			return fileName.replaceAll("/", "")
		}
	}
}
