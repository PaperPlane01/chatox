import {StickersMap} from "./StickersMap";

export interface StickerPackFormData {
	name?: string
	description?: string
	stickers: StickersMap
	author?: string
}
