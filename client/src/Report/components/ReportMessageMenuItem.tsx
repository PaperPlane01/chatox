import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Report} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";

interface ReportMessageMenuItemProps {
    messageId: string,
    onClick?: () => void
}

export const ReportMessageMenuItem: FunctionComponent<ReportMessageMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
    const {
        reportMessage: {
            setReportedObjectId
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setReportedObjectId(messageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Report/>
            </ListItemIcon>
            <ListItemText>
                {l("report")}
            </ListItemText>
        </MenuItem>
    );
});
