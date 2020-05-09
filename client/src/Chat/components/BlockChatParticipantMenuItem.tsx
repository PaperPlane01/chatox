import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {Localized, localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface BlockChatParticipantMenuItemMobxProps {
    setBlockedUserId: (userId: string) => void,
    setCreateChatBlockingDialogOpen: (createChatBlockingDialogOpen: boolean) => void
}

interface BlockChatParticipantMenuItemOwnProps {
    userId: string,
    onClick?: () => void
}

type BlockChatParticipantMenuItemProps = BlockChatParticipantMenuItemMobxProps & BlockChatParticipantMenuItemOwnProps
    & Localized;

const _BlockChatParticipantMenuItem: FunctionComponent<BlockChatParticipantMenuItemProps> = ({
    setBlockedUserId,
    setCreateChatBlockingDialogOpen,
    userId,
    onClick,
    l
}) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setBlockedUserId(userId);
        setCreateChatBlockingDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Block/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.blocking.block-user")}
            </ListItemText>
        </MenuItem>
    )
};

const mapMobxToProps: MapMobxToProps<BlockChatParticipantMenuItemMobxProps> = ({createChatBlocking}) => ({
    setBlockedUserId: userId => createChatBlocking.setFormValue("blockedUserId", userId),
    setCreateChatBlockingDialogOpen: createChatBlocking.setCreateChatBlockingDialogOpen
});

export const BlockChatParticipantMenuItem = localized(
    inject(mapMobxToProps)(observer(_BlockChatParticipantMenuItem))
) as FunctionComponent<BlockChatParticipantMenuItemOwnProps>;

