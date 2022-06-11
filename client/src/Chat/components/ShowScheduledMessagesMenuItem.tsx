import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Event} from "@mui/icons-material";
import {useLocalization, useRouter, useStore} from "../../store";
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
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const routerStore = useRouter();
    const {l} = useLocalization();

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        routerStore.router.goTo(Routes.scheduledMessagesPage, {slug: chat.slug || chat.id});
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
