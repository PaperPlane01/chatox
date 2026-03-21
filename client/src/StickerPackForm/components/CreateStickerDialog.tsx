import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {noop} from "lodash";
import {StickerEmojiPickerDialog} from "./StickerEmojiPickerDialog";
import {StickerUpload} from "./StickerUpload";
import {useStickerPackForm} from "../hooks";
import {StickerPackFormContext} from "../types";
import {StickerContainer} from "../stores";
import {ChipInput} from "../../ChipInput";
import {useLocalization, useStore} from "../../store";

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
        stickerEmojiPickerDialog: {
            setStickerEmojiPickerDialogOpen
        },
        emoji: {
            selectedEmojiSet
        }
    } = useStore();
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
        <Fragment>
            <Dialog open={createStickerDialogOpen}
                    onClose={handleClose}
                    fullWidth
                    maxWidth="sm"
            >
                <DialogContent>
                    <div className={classes.centered}>
                        <StickerUpload stickerContainer={stickerContainer}/>
                    </div>
                    <ChipInput value={stickerContainer.emojis}
                               onDelete={index => stickerContainer.removeEmojiByIndex(index)}
                               onClick={() => setStickerEmojiPickerDialogOpen(true)}
                               slotProps={{
                                   input: {
                                       onChange: noop
                                   }
                               }}
                               label={l("sticker.emojis")}
                               renderLabel={emoji => (
                                   <em-emoji size="16"
                                             id={emoji.id}
                                             set={selectedEmojiSet}
                                             native={emoji.native}
                                   />
                               )}
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
                        {l("sticker.add")}
                    </Button>
                </DialogActions>
            </Dialog>
            <StickerEmojiPickerDialog onEmojiPicked={stickerContainer.addEmoji}/>
        </Fragment>
    );
});
