import {BlobReader, Entry, FileEntry, TextWriter, ZipReader} from "@zip.js/zip.js";

export class DotLottieZipWorker {

	async getLottieAnimation(dotLottieSrc: string): Promise<string | undefined> {
		const response = await fetch(dotLottieSrc);

		if (!response.ok) {
			return undefined;
		}

		const zipBlob = await response.blob();
		const blobReader = new BlobReader(zipBlob);
		const zipReader = new ZipReader(blobReader);

		const animationEntry = (await zipReader.getEntries()).find(entry => entry.filename === "animations/main.json");

		if (!animationEntry || !this.isFileEntry(animationEntry)) {
			return;
		}

		const textWriter = new TextWriter();
		return await animationEntry.getData(textWriter);
	}

	private isFileEntry(entry: Entry): entry is FileEntry {
		return typeof (entry as any).getData === "function";
	}
}