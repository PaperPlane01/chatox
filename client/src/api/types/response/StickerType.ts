import {UploadType} from "./UploadType";

export type StickerType = UploadType.IMAGE_STICKER | UploadType.WEBP_STICKER;

export const STICKER_TYPES: StickerType[] = [
	UploadType.IMAGE_STICKER,
	UploadType.WEBP_STICKER
];
