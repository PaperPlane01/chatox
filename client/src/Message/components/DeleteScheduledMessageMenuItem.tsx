import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";

interface DeleteScheduledMessageMenuItemProps {
    messageId: string,
    onClick?: () => void
}

export const DeleteScheduledMessageMenuItem: FunctionComponent<DeleteScheduledMessageMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
    const {
        deleteScheduledMessage: {
            deleteScheduledMessage
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        deleteScheduledMessage(messageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Delete/>
            </ListItemIcon>
            <ListItemText>
                {l("common.delete")}
            </ListItemText>
        </MenuItem>
    );
});
