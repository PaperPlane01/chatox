import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store";

interface BlockUserMenuItemProps {
    userId: string,
    onClick?: () => void
}

export const BlockUserMenuItem: FunctionComponent<BlockUserMenuItemProps> = observer(({
    userId,
    onClick
}) => {
    const {
        addUserToBlacklist: {
            addUserToBlacklist,
            pendingUsersMap
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        addUserToBlacklist(userId);
    }

    return (
        <MenuItem onClick={handleClick}
                  disabled={pendingUsersMap[userId] && pendingUsersMap[userId].pending}
        >
            <ListItemIcon>
                <Block/>
            </ListItemIcon>
            <ListItemText>
                {l("blacklist.users.add")}
            </ListItemText>
        </MenuItem>
    );
});
