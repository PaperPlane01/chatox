import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ChatParticipantsList} from "./ChatParticipantsList";
import {useLocalization, useStore} from "../../store";

export const OnlineChatParticipantsList: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        onlineChatParticipants: {
            onlineParticipants,
            onlineParticipantsCount,
            getFetchingState
        }
    } = useStore();
    const {l} = useLocalization();

    if (!selectedChatId) {
        return null;
    }

    const fetchingState = getFetchingState(selectedChatId);

    return (
        <ChatParticipantsList participantsIds={onlineParticipants}
                              fetchingState={fetchingState}
                              label={
                                  l(
                                      "chat.online-participants-count",
                                      {onlineParticipantsCount: `${onlineParticipantsCount}`}
                                  )
                              }
        />
    );
});
