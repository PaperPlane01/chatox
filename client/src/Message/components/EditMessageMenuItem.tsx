import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store";

interface EditMessageMenuItemProps {
    onClick?: () => void,
    messageId: string
}

export const EditMessageMenuItem: FunctionComponent<EditMessageMenuItemProps> = observer(({
    onClick,
    messageId
}) => {
    const {
        messageUpdate: {
            setUpdatedMessageId
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setUpdatedMessageId(messageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Edit/>
            </ListItemIcon>
            <ListItemText>
                {l("message.edit.short")}
            </ListItemText>
        </MenuItem>
    )
});
