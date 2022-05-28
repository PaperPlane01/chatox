import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Report} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";

interface ReportChatMenuItemProps {
    chatId: string,
    onClick?: () => void
}

export const ReportChatMenuItem: FunctionComponent<ReportChatMenuItemProps> = observer(({
    chatId,
    onClick
}) => {
    const {
        reportChat: {
            setReportedObjectId
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setReportedObjectId(chatId);
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
