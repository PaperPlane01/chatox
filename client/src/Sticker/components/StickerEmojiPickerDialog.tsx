import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogTitle, DialogContent, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {Picker, EmojiData} from "emoji-mart";
import {useStore} from "../../store";

interface StickerEmojiPickerDialogProps {
    onEmojiPicked: (emoji: EmojiData) => void
}

export const StickerEmojiPickerDialog: FunctionComponent<StickerEmojiPickerDialogProps> = observer(({
    onEmojiPicked
}) => {
    const {
        stickerEmojiPickerDialog: {
            stickerEmojiPickerDialogOpen,
            setStickerEmojiPickerDialogOpen
        },
        emoji: {
            selectedEmojiSet
        }
    } = useStore();

    const handlePick = (emoji: EmojiData): void => {
        onEmojiPicked(emoji);
        setStickerEmojiPickerDialogOpen(false);
    };

    return (
        <Dialog open={stickerEmojiPickerDialogOpen}
                onClose={() => setStickerEmojiPickerDialogOpen(false)}
                fullWidth
                maxWidth="sm"
        >
            <DialogTitle>
                <IconButton
                    onClick={() => setStickerEmojiPickerDialogOpen(false)}
                    style={{
                        float: "left"
                    }}
                    size="large">
                    <Close/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Picker onSelect={handlePick}
                        set={selectedEmojiSet === "native" ? undefined : selectedEmojiSet}
                        native={selectedEmojiSet === "native"}
                        autoFocus={false}
                />
            </DialogContent>
        </Dialog>
    );
});
