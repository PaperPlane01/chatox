import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {AlarmAdd} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface ScheduleMessageMenuItemProps {
    onClick?: () => void
}

export const ScheduleMessageMenuItem: FunctionComponent<ScheduleMessageMenuItemProps> = observer(({
    onClick
}) => {
    const {
        scheduleMessage: {
            setScheduleMessageDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setScheduleMessageDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <AlarmAdd/>
            </ListItemIcon>
            <ListItemText>
                {l("message.delayed-message.create")}
            </ListItemText>
        </MenuItem>
    );
});
