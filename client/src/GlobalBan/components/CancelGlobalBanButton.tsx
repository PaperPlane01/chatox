import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {IconButton, CircularProgress, Tooltip} from "@mui/material";
import {Cancel} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {ensureEventWontPropagate} from "../../utils/event-utils";

interface CancelGlobalBanButtonProps {
    globalBanId: string
}

export const CancelGlobalBanButton: FunctionComponent<CancelGlobalBanButtonProps> = observer(({globalBanId}) => {
    const {
        cancelGlobalBan: {
            isGlobalBanCancellationPending,
            cancelGlobalBan
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        ensureEventWontPropagate(event);
        cancelGlobalBan(globalBanId);
    };

    if (isGlobalBanCancellationPending(globalBanId)) {
        return <CircularProgress size={24} color="primary"/>
    }

    return (
        <Tooltip title={l("cancel")}>
            <IconButton onClick={handleClick} size="large">
                <Cancel/>
            </IconButton>
        </Tooltip>
    );
});
