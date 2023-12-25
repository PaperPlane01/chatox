import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemText} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {EditChatInviteButton} from "./EditChatInviteButton";
import {getChatInviteLink} from "../utils";
import {CopyToClipboardButton} from "../../CopyToClipboardButton";
import {useEntities, useStore} from "../../store";
import {isStringEmpty} from "../../utils/string-utils";

interface ChatInviteListItemProps {
    chatInviteId: string
}

const useStyles = makeStyles(() => createStyles({
    chatInviteListItem: {
        cursor: "pointer"
    }
}));

export const ChatInviteListItem: FunctionComponent<ChatInviteListItemProps> = observer(({
    chatInviteId
}) => {
    const {
        chatInviteDialog: {
            openDialogToInvite
        }
    } = useStore();
    const {
        chatInvites: {
            findById: findChatInvite
        }
    } = useEntities();
    const classes = useStyles();

    const chatInvite = findChatInvite(chatInviteId);

    const handleClick = (): void => {
        openDialogToInvite(chatInviteId);
    };

    const link = getChatInviteLink(chatInviteId);

    return (
        <ListItem onClick={handleClick}
                  className={classes.chatInviteListItem}
        >
            <ListItemText>
                {isStringEmpty(chatInvite.name) ? link : chatInvite.name}
            </ListItemText>
            <CopyToClipboardButton content={link}
                                   successLabel="chat.invite.copy.success"
            />
            <EditChatInviteButton chatInviteId={chatInviteId}/>
        </ListItem>
    );
});
