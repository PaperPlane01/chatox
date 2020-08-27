import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ReactMarkdown from "react-markdown";
import {Data} from "emoji-mart";
import appleData from "emoji-mart/data/apple.json";
import {useLocalization, useStore} from "../../store";
import {parseEmojis} from "../../utils/parse-emojis";

const breaks = require("remark-breaks");

interface MarkdownPreviewDialogProps {
    text: string
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
                                               {parseEmojis(props.value as string, appleData as any as Data)}
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
