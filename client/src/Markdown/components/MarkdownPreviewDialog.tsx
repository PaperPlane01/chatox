import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography} from "@mui/material";
import {Close} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import {useLocalization, useStore} from "../../store";
import {MessageEmoji} from "../../api/types/response";
import {useEmojiParser} from "../../Emoji";

const breaks = require("remark-breaks");

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
    const {parseEmoji} = useEmojiParser();

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
                <Typography>
                    <ReactMarkdown children={text}
                                   remarkPlugins={[breaks]}
                                   components={{
                                       text: (props: any) => (
                                           <Fragment>
                                               {parseEmoji(props.value as string)}
                                           </Fragment>
                                       )
                                   }}
                    />
                </Typography>
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
