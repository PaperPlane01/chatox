import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Tooltip} from "@mui/material";
import {Code} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const OpenMarkdownPreviewDialogButton: FunctionComponent = observer(() => {
    const {
        markdownPreviewDialog: {
            setMarkdownPreviewDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Tooltip title={l("markdown.preview.show")}>
            <IconButton onClick={() => setMarkdownPreviewDialogOpen(true)} size="large">
                <Code/>
            </IconButton>
        </Tooltip>
    );
});
