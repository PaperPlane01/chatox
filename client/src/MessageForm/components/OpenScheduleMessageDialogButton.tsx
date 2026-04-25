import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {Event} from "@mui/icons-material";
import {useStore} from "../../store";

interface OpenScheduleMessageDialogButtonProps {
    className?: string
}

export const OpenScheduleMessageDialogButton: FunctionComponent<OpenScheduleMessageDialogButtonProps> = observer(({
    className
}) => {
    const {
        scheduleMessage: {
            setScheduleMessageDialogOpen
        }
    } = useStore();

    return (
        <IconButton
            onClick={() => setScheduleMessageDialogOpen(true)}
            className={className}
            size="large">
            <Event/>
        </IconButton>
    );
});
