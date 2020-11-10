import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Tooltip} from "@material-ui/core";
import {Code} from "@material-ui/icons";
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
            <IconButton onClick={() => setMarkdownPreviewDialogOpen(true)}>
                <Code/>
            </IconButton>
        </Tooltip>
    );
});
