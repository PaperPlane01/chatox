import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemText} from "@mui/material";
import {EditChatInviteButton} from "./EditChatInviteButton";
import {getChatInviteLink} from "../utils";
import {CopyToClipboardButton} from "../../CopyToClipboardButton";
import {useStore} from "../../store";

interface ChatInviteListItemProps {
    chatInviteId: string
}

export const ChatInviteListItem: FunctionComponent<ChatInviteListItemProps> = observer(({
    chatInviteId
}) => {
    const {
        chatInviteDialog: {
            openDialogToInvite
        }
    } = useStore();

    const handleClick = (): void => {
        openDialogToInvite(chatInviteId);
    };

    const link = getChatInviteLink(chatInviteId);

    return (
        <ListItem onClick={handleClick}>
            <ListItemText>
                {link}
            </ListItemText>
            <CopyToClipboardButton content={link}
                                   successLabel="chat.invite.copy.success"
            />
            <EditChatInviteButton chatInviteId={chatInviteId}/>
        </ListItem>
    );
});
