import React, {FunctionComponent, MouseEvent} from "react";
import {observer} from "mobx-react";
import {ListItemText, MenuItem} from "@material-ui/core";
import {useLocalization, useStore} from "../../store/hooks";

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
