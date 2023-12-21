import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {ContentCopy} from "@mui/icons-material";
import {useSnackbar} from "notistack";
import copy from "copy-to-clipboard";
import {Labels} from "../../localization";
import {useLocalization} from "../../store";
import {ensureEventWontPropagate} from "../../utils/event-utils";

interface CopyToClipboardButtonProps {
    content: string,
    successLabel?: keyof Labels
}

export const CopyToClipboardButton: FunctionComponent<CopyToClipboardButtonProps> = observer(({
    content,
    successLabel = "common.copy.success"
}) => {
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
        ensureEventWontPropagate(event);

        copy(content, {
            onCopy: () => {
                enqueueSnackbar(l(successLabel));
            }
        });
    };

    return (
        <IconButton onClick={handleClick}>
            <ContentCopy/>
        </IconButton>
    );
});
