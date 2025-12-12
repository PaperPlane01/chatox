import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BaseStickerPackPreviewProps} from "./BaseStickerPackPreviewProps";
import {Avatar} from "../../Avatar";

export const ImageStickerPackPreview: FunctionComponent<BaseStickerPackPreviewProps> = observer(({
	upload,
	width,
	height,
	size
}) => {
	const sizeQuery = `?size=${size ?? 256}`

	return (
		<Avatar avatarLetter=""
				avatarColor=""
				shape="square"
				width={width}
				height={height}
				avatarUri={`${upload.uri}${sizeQuery}`}
		/>
	);
});
