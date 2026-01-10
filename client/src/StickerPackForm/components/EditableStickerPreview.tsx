import React, {FunctionComponent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import clsx from "clsx";
import {EditableStickerPreviewProps} from "./EditableStickerPreviewProps";
import {EditableImageStickerPreview} from "./EditableImageStickerPreview";
import {EditableLottieStickerPreview} from "./EditableLottieStickerPreview";
import {EditableVideoStickerPreview} from "./EditableVideoStickerPreview";
import {isImageSticker, isLottieSticker, isVideoSticker} from "../../api/types/response";

const useStyles = makeStyles(() => createStyles({
	hovered: {
		boxShadow: "inset 0 0 0 1000px rgba(0, 0, 0, 0.5)"
	}
}));

export const EditableStickerPreview: FunctionComponent<EditableStickerPreviewProps> = observer(({
	stickerContainer
}) => {
	const classes = useStyles();
	const [hovered, setHovered] = useState(false);

	let stickerPreview: ReactNode = null;

	if (isImageSticker(stickerContainer.stickerType)) {
		stickerPreview = <EditableImageStickerPreview stickerContainer={stickerContainer}/>
	} else if (isLottieSticker(stickerContainer.stickerType)) {
		stickerPreview = <EditableLottieStickerPreview stickerContainer={stickerContainer}/>;
	} else if (isVideoSticker(stickerContainer.stickerType)) {
		stickerPreview = <EditableVideoStickerPreview stickerContainer={stickerContainer}/>
	}

	return (
		<div onMouseOver={() => setHovered(true)}
			 onMouseOut={() => setHovered(false)}
			 onTouchStart={() => setHovered(true)}
			 onTouchEnd={() => setHovered(false)}
			 onFocus={() => setHovered(true)}
			 onBlur={() => setHovered(false)}
			 className={clsx({[classes.hovered]: hovered})}
		>
			{stickerPreview}
		</div>
	);
});
