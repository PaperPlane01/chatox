import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Emoji} from "emoji-mart";
import {noop} from "lodash";
import {StickerEmojiPickerDialog} from "./StickerEmojiPickerDialog";
import {useStickerPackForm} from "../hooks";
import {StickerPackFormContext} from "../types";
import {StickerContainer} from "../stores";
import {ChipInput} from "../../ChipInput";
import {useLocalization, useStore} from "../../store";
import {StickerUpload} from "./StickerUpload";
import {EditableStickerPreview} from "./EditableStickerPreview";

interface EditStickerDialogProps {
	stickerContainer: StickerContainer,
	context: StickerPackFormContext,
	hideUploadInput?: boolean
}

const useStyles = makeStyles(() => createStyles({
	centered: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "column"
	}
}));

export const EditStickerDialog: FunctionComponent<EditStickerDialogProps> = observer(({
    stickerContainer,
    context,
	hideUploadInput = false
}) => {
	const {
		stickerEmojiPickerDialog: {
			setStickerEmojiPickerDialogOpen
		},
		emoji: {
			selectedEmojiSet
		}
	} = useStore();
	const {
		editStickerDialogOpen,
		editSticker,
		clearEditedSticker,
		setEditStickerDialogOpen
	} = useStickerPackForm(context)
	const {l} = useLocalization();
	const classes = useStyles();

	const handleAdd = (): void => {
		if (stickerContainer.validate()) {
			editSticker(stickerContainer);
			setEditStickerDialogOpen(false);
			clearEditedSticker();
		}
	};

	const handleClose = (): void => {
		setEditStickerDialogOpen(false);
		clearEditedSticker();
	};

	return (
		<Fragment>
			<Dialog open={editStickerDialogOpen}
					onClose={handleClose}
					fullWidth
					maxWidth="sm"
			>
				<DialogContent>
					<div className={classes.centered}>
						{!hideUploadInput && (
							<StickerUpload stickerContainer={stickerContainer}/>
						)}
						{hideUploadInput && stickerContainer.uploadContainer && (
							<EditableStickerPreview stickerContainer={stickerContainer}/>
						)}
					</div>
					<ChipInput value={stickerContainer.emojis}
							   onDelete={index => stickerContainer.removeEmojiByIndex(index)}
							   onClick={() => setStickerEmojiPickerDialogOpen(true)}
							   InputProps={{
								   onChange: noop
							   }}
							   renderLabel={emoji => (
								   <Emoji size={16}
										  emoji={emoji}
										  set={selectedEmojiSet !== "native" ? selectedEmojiSet : undefined}
										  native={selectedEmojiSet === "native"}
								   />
							   )}
							   label={l("sticker.emojis")}
							   getChipKey={emoji => emoji.name}
					/>
					<ChipInput value={stickerContainer.keywords}
							   onAdd={keyword => stickerContainer.addKeyword(keyword)}
							   onDelete={index => stickerContainer.removeKeywordByIndex(index)}
							   helperText={stickerContainer.errors.keywords && l(stickerContainer.errors.keywords)}
							   label={l("sticker.keywords")}
							   fullWidth
							   margin="dense"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}
							variant="outlined"
							color="secondary"
					>
						{l("close")}
					</Button>
					<Button onClick={handleAdd}
							variant="contained"
							color="primary"
					>
						{l("save-changes")}
					</Button>
				</DialogActions>
			</Dialog>
			<StickerEmojiPickerDialog onEmojiPicked={stickerContainer.addEmoji}/>
		</Fragment>
	);
});
