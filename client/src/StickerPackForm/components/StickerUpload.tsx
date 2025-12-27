import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {StickerUploadProps} from "./StickerUploadProps";
import {ImageStickerUpload} from "./ImageStickerUpload";
import {LottieStickerUpload} from "./LottieStickerUpload";
import {isImageSticker, isLottieSticker} from "../../api/types/response";

export const StickerUpload: FunctionComponent<StickerUploadProps> = observer(({
	stickerContainer
}) => {
	if (isImageSticker(stickerContainer.stickerType)) {
		return <ImageStickerUpload stickerContainer={stickerContainer}/>;
	} else if (isLottieSticker(stickerContainer.stickerType)) {
		return <LottieStickerUpload stickerContainer={stickerContainer}/>;
	} else {
		return null;
	}
});
