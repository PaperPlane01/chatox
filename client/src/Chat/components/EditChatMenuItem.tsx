import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface EditChatMenuItemMobxProps {
    setUpdateChatDialogOpen: (updateChatDialogOpen: boolean) => void
}

interface EditChatMenuItemOwnProps {
    onClick?: () => void
}

type EditChatMenuItemProps = EditChatMenuItemMobxProps & EditChatMenuItemOwnProps & Localized;

const _EditChatMenuItem: FunctionComponent<EditChatMenuItemProps> = ({
    setUpdateChatDialogOpen,
    onClick,
    l
}) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setUpdateChatDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Edit/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.edit")}
            </ListItemText>
        </MenuItem>
    )
};

const mapMoxToProps: MapMobxToProps<EditChatMenuItemMobxProps> = ({chatUpdate}) => ({
    setUpdateChatDialogOpen: chatUpdate.setUpdateChatDialogOpen
});

export const EditChatMenuItem = localized(
    inject(mapMoxToProps)(observer(_EditChatMenuItem))
) as FunctionComponent<EditChatMenuItemOwnProps>;
