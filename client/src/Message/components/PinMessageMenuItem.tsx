import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {useLocalization, useStore} from "../../store/hooks";
import {Pin} from "../../icons";

interface PinMessageMenuItemProps {
    onClick?: () => void,
    messageId: string
}

export const PinMessageMenuItem: FunctionComponent<PinMessageMenuItemProps> = observer(({
    onClick,
    messageId
}) => {
    const {
        pinMessage: {
            pinMessage
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        pinMessage(messageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Pin/>
            </ListItemIcon>
            <ListItemText>
                {l("message.pin")}
            </ListItemText>
        </MenuItem>
    );
});
