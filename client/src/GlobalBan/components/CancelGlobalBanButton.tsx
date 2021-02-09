import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {IconButton, CircularProgress, Tooltip} from "@material-ui/core";
import {Cancel} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

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
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.preventDefault();
        event.nativeEvent.stopImmediatePropagation();
        event.nativeEvent.stopPropagation();
        cancelGlobalBan(globalBanId);
    };

    if (isGlobalBanCancellationPending(globalBanId)) {
        return <CircularProgress size={24} color="primary"/>
    }

    return (
        <Tooltip title={l("cancel")}>
            <IconButton onClick={handleClick}>
                <Cancel/>
            </IconButton>
        </Tooltip>
    )
});
