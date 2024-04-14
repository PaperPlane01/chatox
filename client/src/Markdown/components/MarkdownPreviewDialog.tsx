import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {MarkdownTextWithEmoji} from "./MardkownTextWithEmoji";
import {useLocalization, useStore} from "../../store";
import {MessageEmoji} from "../../api/types/response";

interface MarkdownPreviewDialogProps {
    text: string,
    emojiData?: MessageEmoji
}

export const MarkdownPreviewDialog: FunctionComponent<MarkdownPreviewDialogProps> = observer(({text}) => {
    const {
        markdownPreviewDialog: {
            markdownPreviewDialogOpen,
            setMarkdownPreviewDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Dialog open={markdownPreviewDialogOpen}
                fullScreen
                onClose={() => setMarkdownPreviewDialogOpen(false)}
        >
            <DialogTitle>
                {l("markdown.preview")}
                <IconButton
                    onClick={() => setMarkdownPreviewDialogOpen(false)}
                    style={{float: "right"}}
                    size="large">
                    <Close/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <MarkdownTextWithEmoji text={text}/>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setMarkdownPreviewDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
