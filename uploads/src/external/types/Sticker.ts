import {UploadResponse} from "../../uploads/types/responses";
import {StickerUploadMetadata} from "../../uploads";

export interface Sticker {
	id: string,
	upload: UploadResponse<StickerUploadMetadata>
}
