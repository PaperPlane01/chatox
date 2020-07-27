import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface BlockUserInChatByIdOrSlugMenuItemMobxProps {
    setBlockUserInChatByIdOrSlugDialogOpen: (blockUserInChatByIdOrSlugDialogOpen: boolean) => void
}

interface BlockUserInChatByIdOrSlugMenuItemOwnProps {
    onClick?: () => void
}

type BlockUserInChatByIdOrSlugMenuItemProps = BlockUserInChatByIdOrSlugMenuItemMobxProps
    & BlockUserInChatByIdOrSlugMenuItemOwnProps & Localized;

const _BlockUserByIdOrSlugMenuItem: FunctionComponent<BlockUserInChatByIdOrSlugMenuItemProps> = ({
    onClick,
    setBlockUserInChatByIdOrSlugDialogOpen,
    l
}) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setBlockUserInChatByIdOrSlugDialogOpen(true);
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

const mapMobxToProps: MapMobxToProps<BlockUserInChatByIdOrSlugMenuItemMobxProps> = ({
    blockUserInChatByIdOrSlug
}) => ({
    setBlockUserInChatByIdOrSlugDialogOpen: blockUserInChatByIdOrSlug.setBlockUserInChatByIdOrSlugDialogOpen
});

export const BlockUserInChatByIdOrSlugMenuItem = localized(
    inject(mapMobxToProps)(observer(_BlockUserByIdOrSlugMenuItem))
) as FunctionComponent<BlockUserInChatByIdOrSlugMenuItemOwnProps>;
