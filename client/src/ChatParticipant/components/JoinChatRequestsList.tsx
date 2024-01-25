import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {List} from "@mui/material";
import {JoinChatRequestListItem} from "./JoinChatRequestsListItem";
import {useStore} from "../../store";

export const JoinChatRequestsList: FunctionComponent = observer(() => {
    const {
        joinChatRequests: {
            joinChatRequestsIds
        }
    } = useStore();

    return (
        <List>
            {joinChatRequestsIds.map(id => (
                <JoinChatRequestListItem pendingChatParticipantId={id}
                                         key={id}
                />
            ))}
        </List>
    );
});
