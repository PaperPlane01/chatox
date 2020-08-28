import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ReactMarkdown from "react-markdown";
import {useLocalization, useStore} from "../../store";
import {MessageEmoji} from "../../api/types/response";
import {useEmojiParser} from "../../Emoji/hooks";

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
                <IconButton onClick={() => setMarkdownPreviewDialogOpen(false)}
                            style={{float: "right"}}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography>
                    <ReactMarkdown source={text}
                                   plugins={[breaks]}
                                   renderers={{
                                       text: props => (
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
