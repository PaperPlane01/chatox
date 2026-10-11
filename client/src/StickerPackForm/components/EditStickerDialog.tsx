import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {EditableStickerPreview} from "./EditableStickerPreview";
import {StickerUpload} from "./StickerUpload";
import {useStickerPackForm} from "../hooks";
import {StickerPackFormContext} from "../types";
import {StickerContainer} from "../stores";
import {ChipInput} from "../../ChipInput";
import {EmojiChipInput} from "../../EmojisChipInput/components";
import {useLocalization} from "../../store/hooks";

interface EditStickerDialogProps {
	stickerContainer: StickerContainer,
	context: StickerPackFormContext,
	hideUploadInput?: boolean
}

const useStyles = makeStyles()(() => ({
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
		editStickerDialogOpen,
		editSticker,
		clearEditedSticker,
		setEditStickerDialogOpen
	} = useStickerPackForm(context)
	const {l} = useLocalization();
	const {classes} = useStyles();

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
        <Dialog
            open={editStickerDialogOpen}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            disableEnforceFocus
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
                <EmojiChipInput
                    value={stickerContainer.emojis}
                    label={l("sticker.emojis")}
                    onDelete={stickerContainer.removeEmojiByIndex}
                    onEmojiPicked={stickerContainer.addEmoji}
                />
                <ChipInput
                    value={stickerContainer.keywords}
                    onAdd={keyword => stickerContainer.addKeyword(keyword)}
                    onDelete={index => stickerContainer.removeKeywordByIndex(index)}
                    helperText={stickerContainer.errors.keywords && l(stickerContainer.errors.keywords)}
                    label={l("sticker.keywords")}
                    fullWidth
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    color="secondary"
                >
                    {l("close")}
                </Button>
                <Button
                    onClick={handleAdd}
                    variant="contained"
                    color="primary"
                >
                    {l("save-changes")}
                </Button>
            </DialogActions>
        </Dialog>
	);
});
