import {StickerPack} from "./StickerPack";
import {Sticker} from "./Sticker";

export interface StickerPackUpdated {
	stickerPack: Omit<StickerPack, "stickers">,
	newStickers: Sticker[],
	removedStickers: Sticker[]
}
