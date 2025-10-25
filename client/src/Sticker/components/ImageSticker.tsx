import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import {BaseStickerProps} from "./BaseStickerProps";
import {stickerWrapperStyle} from "../styles";
import {useEntityById, useEntitySelector} from "../../entities";

const useStyles = makeStyles(() => createStyles({
	stickerWrapper: stickerWrapperStyle,
	image: {
		maxWidth: "100%",
		maxHeight: "100%",
		height: "inherit",
		objectFit: "contain"
	}
}));

export const ImageSticker: FunctionComponent<BaseStickerProps> = observer(({
	stickerId,
	size,
	onClick,
	onLoad
}) => {
	const sticker = useEntityById("stickers", stickerId);
	const upload = useEntitySelector("uploads", entities => entities.uploads.findSticker(sticker.uploadId));
	const classes = useStyles();
	const sizeQuery = size ? `?size=${size}` : "";

	return (
		<div className={classes.stickerWrapper}
			 onClick={onClick}
		>
			<img src={`${upload.uri}${sizeQuery}`}
				 className={classes.image}
				 onLoad={onLoad}
			/>
		</div>
	);
});
