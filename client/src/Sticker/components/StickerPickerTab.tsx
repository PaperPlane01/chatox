import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Tab, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {useEntityById, useEntitySelector} from "../../entities";

interface StickerPickerTabProps {
	stickerPackId: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
	imageWrapper: {
		display: "inline-block",
		position: "relative",
		height: "100%",
		width: "100%",
		cursor: "pointer"
	},
	image: {
		maxWidth: "100%",
		maxHeight: "100%",
		height: "inherit",
		objectFit: "contain"
	},
	tabRoot: {
		width: 48,
		height: 48,
		minWidth: 48,
		padding: theme.spacing(1)
	}
}));

export const StickerPickerTab: FunctionComponent<StickerPickerTabProps> = observer(({
	stickerPackId
}) => {
	const classes = useStyles();
	const stickerPack = useEntityById("stickerPacks", stickerPackId);
	const preview = useEntitySelector("uploads", entities => entities.uploads.findImage(stickerPack.previewId));

	return (
		<Tab value={stickerPackId}
			 icon={
				 <div className={classes.imageWrapper}>
					 <img src={`${preview.uri}?size=64`}
						  className={classes.image}
					 />
				 </div>
			 }
			 classes={{
				 root: classes.tabRoot
			 }}
		/>
	);
});
