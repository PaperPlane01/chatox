import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {useAuthorization, useLocalization, useStore} from "../../store";

interface BlockMessageAuthorInChatMenuItemProps {
    onClick?: () => void,
    messageId: string
}

export const BlockMessageAuthorInChatMenuItem: FunctionComponent<BlockMessageAuthorInChatMenuItemProps> = observer(({
    onClick,
    messageId
}) => {
    const {
        chat: {
            selectedChatId
        },
        entities: {
            chatParticipations: {
                findByUserAndChat: findChatParticipation
            },
            messages: {
                findById: findMessage
            },
            users: {
                findById: findUser
            }
        },
        createChatBlocking: {
            setFormValue,
            setCreateChatBlockingDialogOpen
        },

    } = useStore();
    const {currentUser} = useAuthorization();
    const {l} = useLocalization();

    const setBlockedUserId = (id: string): void => setFormValue("blockedUserId", id);

    const chatParticipation = currentUser && selectedChatId  && findChatParticipation({
        userId: currentUser.id,
        chatId: selectedChatId
    });

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        const message = findMessage(messageId);
        const user = findUser(message.sender);

        setBlockedUserId(user.id);
        setCreateChatBlockingDialogOpen(true);
    };

    if (chatParticipation && canBlockUsersInChat(chatParticipation)) {
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
    } else {
        return null;
    }
});
