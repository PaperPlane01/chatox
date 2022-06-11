import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Report} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";

interface ReportUserMenuItemProps {
    userId: string,
    onClick?: () => void
}

export const ReportUserMenuItem: FunctionComponent<ReportUserMenuItemProps> = observer(({
    userId,
    onClick
}) => {
    const {
        reportUser: {
            setReportedObjectId
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setReportedObjectId(userId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Report/>
            </ListItemIcon>
            <ListItemText>
                {l("report.user")}
            </ListItemText>
        </MenuItem>
    );
});
