import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Reply} from "@material-ui/icons";
import {localized, Localized} from "../../localization/components";
import {MapMobxToProps} from "../../store";

interface ReplyToMessageMenuItemMobxProps {
    setReferredMessageId: (referredMessageId?: string) => void
}

interface ReplyToMessageMenuItemOwnProps {
    onClick?: () => void,
    messageId: string
}

type ReplyToMessageMenuItemProps = ReplyToMessageMenuItemMobxProps
    & ReplyToMessageMenuItemOwnProps
    & Localized;

const _ReplyToMessageMenuItem: FunctionComponent<ReplyToMessageMenuItemProps> = ({
    messageId,
    setReferredMessageId,
    onClick,
    l
}) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setReferredMessageId(messageId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Reply/>
            </ListItemIcon>
            <ListItemText>
                {l("message.reply")}
            </ListItemText>
        </MenuItem>
    )
};

const mapMobxToProps: MapMobxToProps<ReplyToMessageMenuItemMobxProps> = ({
    messageCreation
}) => ({
    setReferredMessageId: messageCreation.setReferredMessageId
});

export const ReplyToMessageMenuItem = localized(
    inject(mapMobxToProps)(observer(_ReplyToMessageMenuItem))
) as FunctionComponent<ReplyToMessageMenuItemOwnProps>;
