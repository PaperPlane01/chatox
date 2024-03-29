import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Reply} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface ReplyToMessageMenuItemProps {
    onClick?: () => void,
    messageId: string
}

export const ReplyToMessageMenuItem: FunctionComponent<ReplyToMessageMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
    const {
        messageCreation: {
            setReferredMessageId
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setReferredMessageId(messageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Reply/>
            </ListItemIcon>
            <ListItemText>
                {l("message.reply")}
            </ListItemText>
        </MenuItem>
    );
});
