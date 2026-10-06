import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {EmojiData} from "emoji-mart";
import {noop} from "lodash";
import {ChipInput} from "../../ChipInput/components";
import {EmojiPicker} from "../../EmojiPicker/components";
import {useSelectedEmojiSet} from "../../Emoji/hooks";

interface EmojisChipInputProps {
    value: EmojiData[],
    label: string,
    onDelete: (index: number) => void,
    onEmojiPicked: (emoji: EmojiData) => void
}

export const EmojiChipInput: FunctionComponent<EmojisChipInputProps> = observer(({
    value,
    label,
    onDelete,
    onEmojiPicked
}) => {
    const emojiSet = useSelectedEmojiSet();
    const [dialogOpen, setDialogOpen] = useState(false);

    const openDialog = (): void => setDialogOpen(true);

    const closeDialog = (): void => setDialogOpen(false);

    const handleEmojiPick = (emoji: EmojiData): void => {
        onEmojiPicked(emoji);
        closeDialog();
    };

    return (
        <Fragment>
            <ChipInput
                value={value}
                onDelete={onDelete}
                onClick={openDialog}
                slotProps={{
                    input: {
                        onChange: noop
                    }
                }}
                label={label}
                renderLabel={emoji => (
                    <em-emoji size="16" id={emoji.id} set={emojiSet} native={emoji.native}/>
                )}
                getChipKey={emoji => emoji.name}
            />
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    <IconButton
                        onClick={closeDialog}
                        style={{float: "right"}}
                        size="large"
                    >
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div style={{width: "100%"}}>
                        <EmojiPicker onEmojiPicked={handleEmojiPick}/>
                    </div>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
});
