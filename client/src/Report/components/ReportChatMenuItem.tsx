import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Report} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";

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
