import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store";

interface RemoveUserFromBlacklistMenuItemProps {
    userId: string,
    onClick?: () => void
}

export const RemoveUserFromBlacklistMenuItem: FunctionComponent<RemoveUserFromBlacklistMenuItemProps> = observer(({
    userId,
    onClick
}) => {
    const {
        removeUserFromBlacklist: {
            pendingUsersMap,
            removeUserFromBlacklist
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        removeUserFromBlacklist(userId);
    }

    return (
        <MenuItem onClick={handleClick}
                  disabled={pendingUsersMap[userId] && pendingUsersMap[userId].pending}
        >
            {pendingUsersMap[userId] && pendingUsersMap[userId].pending && <CircularProgress size={15} color="primary"/>}
            <ListItemIcon>
                <Block/>
            </ListItemIcon>
            <ListItemText>
                {l("blacklist.users.remove")}
            </ListItemText>
        </MenuItem>
    );
});
