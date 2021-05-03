import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Report} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";

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
