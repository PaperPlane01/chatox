import {StickerEntity} from "./StickerEntity";
import {Relationships} from "../../repository";
import {Upload} from "../../api/types/response";

export interface StickerPackRelationships extends Relationships {
	stickers: StickerEntity[],
	uploads: Upload<any>[]
}
