import React, {FunctionComponent} from "react";
import {inject} from "mobx-react";
import {IconButton, Tooltip} from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface OpenMardownPreviewDialogButtonMobxProps {
    setMarkdownPreviewDialogOpen: (markdownPreviewDialogOpen: boolean) => void
}

type OpenMardownPreviewDialogButtonProps = OpenMardownPreviewDialogButtonMobxProps & Localized;

const _OpenMarkdownPreviewDialogButton: FunctionComponent<OpenMardownPreviewDialogButtonProps> = ({
    setMarkdownPreviewDialogOpen,
    l
}) => (
    <Tooltip title={l("markdown.preview.show")}>
        <IconButton onClick={() => setMarkdownPreviewDialogOpen(true)}>
            <CodeIcon/>
        </IconButton>
    </Tooltip>
);

const mapMobxToProps: MapMobxToProps<OpenMardownPreviewDialogButtonMobxProps> = ({markdownPreviewDialog}) => ({
    setMarkdownPreviewDialogOpen: markdownPreviewDialog.setMarkdownPreviewDialogOpen
});

export const OpenMarkdownPreviewDialogButton = localized(
    inject(mapMobxToProps)(_OpenMarkdownPreviewDialogButton)
) as FunctionComponent;
