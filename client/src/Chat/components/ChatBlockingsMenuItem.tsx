import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {AssignmentInd} from "@material-ui/icons";
import {FetchOptions} from "../../utils/types";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface ChatBlockingsMenuItemMobxProps {
    setChatBlockingsDialogOpen: (chatBlockingsDialogOpen: boolean) => void,
    fetchChatBlockings: (fetchOptions: FetchOptions) => void
}

interface ChatBlockingsMenuItemOwnProps {
    onClick?: () => void
}

type ChatBlockingsMenuItemProps = ChatBlockingsMenuItemMobxProps & ChatBlockingsMenuItemOwnProps & Localized;

const _ChatBlockingsMenuItem: FunctionComponent<ChatBlockingsMenuItemProps> = ({
    setChatBlockingsDialogOpen,
    fetchChatBlockings,
    l,
    onClick
}) => {
    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        fetchChatBlockings({abortIfInitiallyFetched: true});
        setChatBlockingsDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <AssignmentInd/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.blocking.blocked-users")}
            </ListItemText>
        </MenuItem>
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingsMenuItemMobxProps> = ({
    chatBlockingsOfChat,
    chatBlockingsDialog
}) => ({
    fetchChatBlockings: chatBlockingsOfChat.fetchChatBlockings,
    setChatBlockingsDialogOpen: chatBlockingsDialog.setChatBlockingsDialogOpen
});

export const ChatBlockingsMenuItem = localized(
    inject(mapMobxToProps)(observer(_ChatBlockingsMenuItem))
) as FunctionComponent<ChatBlockingsMenuItemOwnProps>;
