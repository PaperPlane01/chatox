import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {IconButton, Tooltip} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {ensureEventWontPropagate} from "../../utils/event-utils";

interface UpdateGlobalBanButtonProps {
    globalBanId: string
}

export const UpdateGlobalBanButton: FunctionComponent<UpdateGlobalBanButtonProps> = observer(({globalBanId}) => {
    const {
        updateGlobalBan: {
            setUpdatedGlobalBanId,
            setUpdateGlobalBanDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const openUpdateGlobalBanDialog = (event: MouseEvent<HTMLButtonElement>): void => {
        ensureEventWontPropagate(event);
        setUpdatedGlobalBanId(globalBanId);
        setUpdateGlobalBanDialogOpen(true);
    };

    return (
        <Tooltip title={l("global.ban.update")}>
            <IconButton onClick={openUpdateGlobalBanDialog} size="large">
                <Edit/>
            </IconButton>
        </Tooltip>
    );
});
