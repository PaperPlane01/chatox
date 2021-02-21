import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemAvatar, ListItemText} from "@material-ui/core";
import randomColor from "randomcolor";
import {useStore} from "../../store";
import {Avatar} from "../../Avatar";
import {getUserAvatarLabel} from "../../User/utils/get-user-avatar-label";
import {getUserDisplayedName} from "../../User/utils/get-user-displayed-name";

interface GlobalBansListItemProps {
    globalBanId: string
}

export const GlobalBansListItem: FunctionComponent<GlobalBansListItemProps> = observer(({
    globalBanId
}) => {
    const {
        entities: {
            globalBans: {
                findById: findGlobalBan
            },
            users: {
                findById: findUser
            }
        },
        globalBanDetailsDialog: {
            setGlobalBanId,
            setGlobalBanDetailsDialogOpen
        }
    } = useStore();

    const globalBan = findGlobalBan(globalBanId);
    const bannedUser = findUser(globalBan.bannedUserId);
    const avatarLabel = getUserAvatarLabel(bannedUser);
    const avatarColor = randomColor({seed: bannedUser.id});

    const handleClick = (): void => {
        setGlobalBanId(globalBanId);
        setGlobalBanDetailsDialogOpen(true);
    }

    return (
        <MenuItem onClick={handleClick}>
            <ListItemAvatar>
                <Avatar avatarLetter={avatarLabel} avatarColor={avatarColor} avatarId={bannedUser.avatarId}/>
            </ListItemAvatar>
            <ListItemText>
                {getUserDisplayedName(bannedUser)}
            </ListItemText>
        </MenuItem>
    );
});
