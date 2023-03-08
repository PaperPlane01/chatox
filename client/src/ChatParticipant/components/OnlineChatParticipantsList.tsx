import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ChatParticipantsList} from "./ChatParticipantsList";
import {useStore} from "../../store";

export const OnlineChatParticipantsList: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        onlineChatParticipants: {
            onlineParticipants,
            getFetchingState
        }
    } = useStore();

    if (!selectedChatId) {
        return null;
    }

    const fetchingState = getFetchingState(selectedChatId);

    return (
        <ChatParticipantsList participantsIds={onlineParticipants}
                              fetchingState={fetchingState}
        />
    );
});
