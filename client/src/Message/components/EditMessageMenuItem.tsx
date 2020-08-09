import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface EditMessageMenuItemMobxProps {
    setUpdatedMessageId: (updatedMessageId: string) => void
}

interface EditMessageMenuItemOwnProps {
    onClick?: () => void,
    messageId: string
}

type EditMessageMenuItemProps = EditMessageMenuItemMobxProps & EditMessageMenuItemOwnProps & Localized;

const _EditMessageMenuItem: FunctionComponent<EditMessageMenuItemProps> = ({
    onClick,
    messageId,
    setUpdatedMessageId,
    l
}) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setUpdatedMessageId(messageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Edit/>
            </ListItemIcon>
            <ListItemText>
                {l("message.edit.short")}
            </ListItemText>
        </MenuItem>
    )
};

const mapMobxToProps: MapMobxToProps<EditMessageMenuItemMobxProps> = ({
    messageUpdate
}) => ({
    setUpdatedMessageId: messageUpdate.setUpdatedMessageId
});

export const EditMessageMenuItem = localized(
    inject(mapMobxToProps)(observer(_EditMessageMenuItem))
) as FunctionComponent<EditMessageMenuItemOwnProps>;
