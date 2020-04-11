import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ReactMarkdown from "react-markdown";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

const breaks = require("remark-breaks");

interface MarkdownPreviewDialogMobxProps {
    markdownPreviewDialogOpen: boolean,
    setMarkdownPreviewDialogOpen: (markdownPreviewDialogOpen: boolean) => void
}

interface MarkdownPreviewDialogOwnProps {
    text: string
}

type MarkdownPreviewDialogProps = MarkdownPreviewDialogMobxProps & MarkdownPreviewDialogOwnProps & Localized;

const _MarkdownPreviewDialog: FunctionComponent<MarkdownPreviewDialogProps> = ({
    text,
    markdownPreviewDialogOpen,
    setMarkdownPreviewDialogOpen,
    l
}) => (
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

const mapMobxToProps: MapMobxToProps<MarkdownPreviewDialogMobxProps> = ({markdownPreviewDialog}) => ({
    markdownPreviewDialogOpen: markdownPreviewDialog.markdownPreviewDialogOpen,
    setMarkdownPreviewDialogOpen: markdownPreviewDialog.setMarkdownPreviewDialogOpen
});

export const MakrdownPreviewDialog = localized(
    inject(mapMobxToProps)(observer(_MarkdownPreviewDialog))
) as FunctionComponent<MarkdownPreviewDialogOwnProps>;
