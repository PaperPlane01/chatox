import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ChatParticipantsList} from "./ChatParticipantsList";
import {useStore} from "../../store";

export const SearchChatParticipantsList: FunctionComponent = observer(() => {
    const {
        chatParticipantsSearch: {
            foundChatParticipantsIds,
            paginationState
        }
    } = useStore();

    return (
        <ChatParticipantsList participantsIds={foundChatParticipantsIds}
                              fetchingState={paginationState}
                              highlightOnline
        />
    );
});