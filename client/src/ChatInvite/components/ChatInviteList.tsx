import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {List} from "@mui/material";
import {ChatInviteListItem} from "./ChatInviteListItem";
import {useStore} from "../../store";

export const ChatInviteList: FunctionComponent = observer(() => {
    const {
        chatInviteList: {
            selectedChatInvitesIds
        }
    } = useStore();

    return (
        <List>
            {selectedChatInvitesIds.map(inviteId => (
                <ChatInviteListItem chatInviteId={inviteId}
                                    key={inviteId}
                />
            ))}
        </List>
    );
});
