import {Upload, ImageUploadMetadata, StickerUploadMetadata} from "../../api/types/response";

export interface BaseStickerPackPreviewProps {
	upload: Upload<StickerUploadMetadata | ImageUploadMetadata>,
	width?: number | string,
	height?: number | string,
	size?: number
}
