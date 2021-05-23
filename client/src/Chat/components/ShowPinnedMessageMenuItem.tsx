import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Visibility} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";

interface ShowPinnedMessageMenuItemProps {
    onClick?: () => void
}

export const ShowPinnedMessageMenuItem: FunctionComponent<ShowPinnedMessageMenuItemProps> = observer(({
    onClick
}) => {
    const {
        pinnedMessages: {
            currentPinnedMessageId
        },
        closedPinnedMessages: {
            showPinnedMessage
        }
    } = useStore();
    const {l} = useLocalization();

    if (!currentPinnedMessageId) {
        return null;
    }

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        showPinnedMessage(currentPinnedMessageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Visibility/>
            </ListItemIcon>
            <ListItemText>
                {l("message.pinned.show")}
            </ListItemText>
        </MenuItem>
    );
});
