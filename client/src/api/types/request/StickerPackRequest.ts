import {StickerRequest} from "./StickerRequest";

export interface StickerPackRequest<S extends StickerRequest> {
	name: string,
	description: string,
	author?: string,
	stickers: S[]
}
