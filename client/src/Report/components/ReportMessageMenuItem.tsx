import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Report} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";

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
