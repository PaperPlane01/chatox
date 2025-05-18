import {StickerContainer} from "../stores";

export interface StickerPackFormData {
	name?: string
	description?: string
	stickers: {[stickerId: string]: StickerContainer}
	author?: string
}
