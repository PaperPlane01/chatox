import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ImageStickerPackPreview} from "./ImageStickerPackPreview";
import {LottieStickerPackPreview} from "./LottieStickerPackPreview";
import {VideoStickerPackPreview} from "./VideoStickerPackPreview";
import {BaseStickerPackPreviewProps} from "./BaseStickerPackPreviewProps";
import {isImageSticker, isLottieSticker, isVideoSticker, StickerType} from "../../api/types/response";

interface StickerPackPreviewProps extends BaseStickerPackPreviewProps {
	stickersType: StickerType
}

export const StickerPackPreview: FunctionComponent<StickerPackPreviewProps> = observer(({
	stickersType,
	...rest
}) => {
	if (isImageSticker(stickersType)) {
		return <ImageStickerPackPreview {...rest}/>;
	} else if (isLottieSticker(stickersType)) {
		return <LottieStickerPackPreview {...rest}/>;
	} else if (isVideoSticker(stickersType)) {
		return <VideoStickerPackPreview {...rest}/>;
	} else {
		return null;
	}
});
