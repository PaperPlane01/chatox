import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@material-ui/core";
import {Event} from "@material-ui/icons";
import {useStore} from "../../store/hooks";

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
        <IconButton onClick={() => setScheduleMessageDialogOpen(true)}
                    className={className}
        >
            <Event/>
        </IconButton>
    );
});
