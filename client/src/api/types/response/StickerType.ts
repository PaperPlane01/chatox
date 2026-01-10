import {UploadType} from "./UploadType";

export type StickerType = UploadType.IMAGE_STICKER
	| UploadType.WEBP_STICKER
	| UploadType.LOTTIE_STICKER
	| UploadType.VIDEO_STICKER;

export const STICKER_TYPES: StickerType[] = [
	UploadType.IMAGE_STICKER,
	UploadType.WEBP_STICKER,
	UploadType.LOTTIE_STICKER,
	UploadType.VIDEO_STICKER
];

export const isImageSticker = (stickerType: StickerType): stickerType is UploadType.IMAGE_STICKER | UploadType.WEBP_STICKER => {
	return stickerType === UploadType.IMAGE_STICKER || stickerType === UploadType.WEBP_STICKER;
};

export const isLottieSticker = (stickerType: StickerType): stickerType is UploadType.LOTTIE_STICKER => {
	return stickerType === UploadType.LOTTIE_STICKER;
};

export const isVideoSticker = (stickerType: StickerType): stickerType is UploadType.VIDEO_STICKER => {
	return stickerType === UploadType.VIDEO_STICKER;
};
