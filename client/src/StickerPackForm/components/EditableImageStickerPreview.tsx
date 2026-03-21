import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {makeStyles} from "tss-react/mui";
import {EditableStickerPreviewProps} from "./EditableStickerPreviewProps";

const useStyles = makeStyles()(() => ({
    image: {
		maxWidth: "100%",
		maxHeight: "100%",
		height: "inherit",
		objectFit: "contain"
	}
}));

export const EditableImageStickerPreview: FunctionComponent<EditableStickerPreviewProps> = observer(({
	stickerContainer
}) => {
	const {classes} = useStyles();

	if (!stickerContainer.uploadContainer) {
		return null;
	}

	return (
		<img src={stickerContainer.uploadContainer.uploadedFile?.uri ?? stickerContainer.uploadContainer.url}
			 className={classes.image}
		/>
	)
});
