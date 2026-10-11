import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {StickerUpload} from "./StickerUpload";
import {useStickerPackForm} from "../hooks";
import {StickerPackFormContext} from "../types";
import {StickerContainer} from "../stores";
import {ChipInput} from "../../ChipInput";
import {useLocalization} from "../../store/hooks";
import {EmojiChipInput} from "../../EmojisChipInput/components";

interface CreateStickerDialogProps {
    stickerContainer: StickerContainer,
    context: StickerPackFormContext
}

const useStyles = makeStyles()(() => ({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
}));

export const CreateStickerDialog: FunctionComponent<CreateStickerDialogProps> = observer(({
    stickerContainer,
    context
}) => {
    const {
        createStickerDialogOpen,
        addSticker,
        clearStickerUnderCreation,
        setCreateStickerDialogOpen
    } = useStickerPackForm(context)
    const {l} = useLocalization();
    const {classes} = useStyles();

    const handleAdd = (): void => {
        if (stickerContainer.validate()) {
            addSticker(stickerContainer);
            setCreateStickerDialogOpen(false);
            clearStickerUnderCreation();
        }
    };

    const handleClose = (): void => {
        setCreateStickerDialogOpen(false);
        clearStickerUnderCreation();
    };

    return (
        <Dialog
            open={createStickerDialogOpen}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            disableEnforceFocus
        >
            <DialogContent>
                <div className={classes.centered}>
                    <StickerUpload stickerContainer={stickerContainer}/>
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
                    {l("sticker.add")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
