import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {ListItemText, MenuItem} from "@mui/material";
import {useLocalization, useStore} from "../../store";

interface UnpinMessageMenuItemProps {
    onClick?: (event: MouseEvent) => void
}

export const UnpinMessageMenuItem: FunctionComponent<UnpinMessageMenuItemProps> = observer(({
    onClick
}) => {
    const {
        unpinMessage: {
            unpinMessage
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (event: MouseEvent): void => {
        if (onClick) {
            onClick(event);
        }

        unpinMessage();
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemText>
                {l("message.unpin")}
            </ListItemText>
        </MenuItem>
    );
});
