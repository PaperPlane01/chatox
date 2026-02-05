import {BlobReader, TextWriter, ZipReader} from "@zip.js/zip.js";
import {isFileEntry} from "./utils";

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

		if (!animationEntry || !isFileEntry(animationEntry)) {
			return undefined;
		}

		const textWriter = new TextWriter();
		return await animationEntry.getData(textWriter);
	}
}
