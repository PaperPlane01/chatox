import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ChatParticipantsList} from "./ChatParticipantsList";
import {useStore} from "../../store";

export const AllChatParticipantsList: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        chatParticipants: {
            getPaginationState,
            chatParticipants
        }
    } = useStore();

    if (!selectedChatId) {
        return null;
    }

    const fetchingState = getPaginationState(selectedChatId);

    return (
        <ChatParticipantsList participantsIds={chatParticipants}
                              fetchingState={fetchingState}
                              highlightOnline
        />
    );
});
