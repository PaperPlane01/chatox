import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, createStyles, makeStyles} from "@material-ui/core";
import ChipInput from "material-ui-chip-input";
import {Emoji} from "emoji-mart";
import {StickerContainer} from "../stores";
import {useLocalization, useStore} from "../../store";
import {StickerEmojiPickerDialog} from "./StickerEmojiPickerDialog";
import {ImageUpload} from "../../Upload";

interface CreateStickerDialogProps {
    stickerContainer: StickerContainer
}

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
}));

export const CreateStickerDialog: FunctionComponent<CreateStickerDialogProps> = observer(({
    stickerContainer
}) => {
    const {
        stickerPackCreation: {
            stickerDialogOpen,
            addSticker,
            clearStickerUnderCreation,
            setStickerDialogOpen
        },
        stickerEmojiPickerDialog: {
            setStickerEmojiPickerDialogOpen
        },
        emoji: {
            selectedEmojiSet
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    const handleAdd = (): void => {
        if (stickerContainer.validate()) {
            addSticker(stickerContainer);
            setStickerDialogOpen(false);
            clearStickerUnderCreation();
        }
    };

    const handleClose = (): void => {
        setStickerDialogOpen(false);
        clearStickerUnderCreation();
    };

    return (
        <Fragment>
            <Dialog open={stickerDialogOpen}
                    onClose={handleClose}
                    fullWidth
                    maxWidth="sm"
            >
                <DialogContent>
                    <div className={classes.centered}>
                        <ImageUpload onFileAttached={stickerContainer.uploadFile}
                                     pending={Boolean(stickerContainer.imageContainer && stickerContainer.imageContainer.pending)}
                                     avatarProps={{
                                         width: 200,
                                         height: 200,
                                         shape: "square",
                                         avatarUri: stickerContainer.imageContainer
                                             ? stickerContainer.imageContainer.url
                                             : undefined
                                     }}
                                     uploadButtonLabel={l("sticker.image")}
                                     validationError={stickerContainer.imageValidationError && l(stickerContainer.imageValidationError)}
                        />
                    </div>
                    <ChipInput value={stickerContainer.emojis.map(emoji => (
                        <Emoji size={16}
                               emoji={emoji}
                               set={selectedEmojiSet !== "native" ? selectedEmojiSet : undefined}
                               native={selectedEmojiSet === "native"}
                        />
                    ))}
                               onDelete={(_, index) => stickerContainer.removeEmojiByIndex(index)}
                               onClick={() => setStickerEmojiPickerDialogOpen(true)}
                               InputProps={{
                                   onChange: () => {}
                               }}
                               helperText={stickerContainer.errors.emojis && l(stickerContainer.errors.emojis)}
                               label={l("sticker.emojis")}
                               fullWidth
                               margin="dense"
                    />
                    <ChipInput value={stickerContainer.keywords}
                               onAdd={keyword => stickerContainer.addKeyword(keyword)}
                               onDelete={(_, index) => stickerContainer.removeKeywordByIndex(index)}
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
                        {l("sticker.add")}
                    </Button>
                </DialogActions>
            </Dialog>
            <StickerEmojiPickerDialog onEmojiPicked={stickerContainer.addEmoji}/>
        </Fragment>
    );
});