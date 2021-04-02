import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

interface EditScheduledMessageMenuItemProps {
    messageId: string,
    onClick?: () => void
}

export const EditScheduledMessageMenuItem: FunctionComponent<EditScheduledMessageMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
    const {
        updateScheduledMessage: {
            setUpdateMessageDialogOpen,
            setMessageId
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setMessageId(messageId);
        setUpdateMessageDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Edit/>
            </ListItemIcon>
            <ListItemText>
                {l("edit")}
            </ListItemText>
        </MenuItem>
    );
});
