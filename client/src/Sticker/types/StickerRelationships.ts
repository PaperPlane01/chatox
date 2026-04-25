import {Relationships} from "../../repository";
import {Upload} from "../../api/types/response";

export interface StickerRelationships extends Relationships {
	uploads: Upload<any>[]
}
