import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import ReactPlayer from "react-player";
import {EditableStickerPreviewProps} from "./EditableStickerPreviewProps";

export const EditableVideoStickerPreview: FunctionComponent<EditableStickerPreviewProps> = observer(({
	stickerContainer
}) => {
	if (!stickerContainer.uploadContainer) {
		return null;
	}

	return (
		<ReactPlayer src={stickerContainer.uploadContainer.uploadedFile?.uri ?? stickerContainer.uploadContainer.url}
					 loop
					 autoPlay
					 muted
					 playsInline
					 controls={false}
		/>
	);
});
