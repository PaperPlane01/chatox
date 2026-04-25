import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Event} from "@mui/icons-material";
import {useLocalization, useRouter, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {Routes} from "../../router";

interface ShowScheduledMessagesMenuItemProps {
    onClick?: () => void
}

export const ShowScheduledMessagesMenuItem: FunctionComponent<ShowScheduledMessagesMenuItemProps> = observer(({
    onClick
}) => {
    const {
        chat: {
            selectedChatId
        }
    } = useStore();
    const routerStore = useRouter();
    const {l} = useLocalization();

    const chat = useEntityById("chats", selectedChatId);

    if (!chat) {
        return null;
    }

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        routerStore.goTo(Routes.scheduledMessagesPage, {slug: chat.slug || chat.id});
    };

    return  (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Event/>
            </ListItemIcon>
            <ListItemText>
                {l("message.delayed-message.list")}
            </ListItemText>
        </MenuItem>
    );
});
