import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {ChatBlockingsMenuItem} from "./ChatBlockingsMenuItem";
import {BlockUserInChatByIdOrSlugMenuItem} from "./BlockUserInChatByIdOrSlugMenuItem";
import {EditChatMenuItem} from "./EditChatMenuItem";
import {canUpdateChat} from "../permissions";
import {canBlockUsersInChat} from "../../ChatBlocking/permissions";
import {useAuthorization, useStore} from "../../store";

export const ChatMenu: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            },
            chatParticipations: {
                findByUserAndChat: findChatParticipation
            }
        }
    } = useStore();
    const {currentUser} = useAuthorization();

    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);

    if (!selectedChatId) {
        return null;
    }

    const chatParticipation = currentUser ?
        findChatParticipation({
            chatId: selectedChatId,
            userId: currentUser.id
        })
        : undefined;
    const chat = findChat(selectedChatId);

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorElement(null);
    };

    const menuItems: ReactNode[] = [];

    canUpdateChat(chat) && menuItems.push(<EditChatMenuItem onClick={handleClose}/>);
    canBlockUsersInChat(chatParticipation) && menuItems.push(<ChatBlockingsMenuItem onClick={handleClose}/>);
    canBlockUsersInChat(chatParticipation) && menuItems.push(<BlockUserInChatByIdOrSlugMenuItem onClick={handleClose}/>);

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <div>
            <IconButton onClick={handleOpenClick} color="inherit">
                <MoreVert/>
            </IconButton>
            <Menu open={menuOpen}
                  onClose={handleClose}
                  anchorEl={anchorElement}
            >
                {menuItems}
            </Menu>
        </div>
    )
});
