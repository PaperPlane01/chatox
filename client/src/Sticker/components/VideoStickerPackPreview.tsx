import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import ReactPlayer from "react-player";
import {BaseStickerPackPreviewProps} from "./BaseStickerPackPreviewProps";

export const VideoStickerPackPreview: FunctionComponent<BaseStickerPackPreviewProps> = observer(({
	upload,
	width,
	height
}) => (
	<ReactPlayer src={upload.uri}
				 width={width}
				 height={height}
				 autoPlay
				 loop
				 muted
				 playsInline
				 controls={false}
	/>
));
