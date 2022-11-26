import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ChatParticipantsList} from "./ChatParticipantsList";
import {useLocalization, useStore} from "../../store";

export const AllChatParticipantsList: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        chatParticipants: {
            getPaginationState,
            chatParticipants
        },
        onlineChatParticipants: {
            onlineParticipantsCount
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l} = useLocalization();

    if (!selectedChatId) {
        return null;
    }

    const fetchingState = getPaginationState(selectedChatId);
    const chat = findChat(selectedChatId);

    return (
        <ChatParticipantsList participantsIds={chatParticipants}
                              fetchingState={fetchingState}
                              label={l(
                                  "chat.number-of-participants",
                                  {
                                      numberOfParticipants: chat.participantsCount,
                                      onlineParticipantsCount: `${onlineParticipantsCount}`
                                  })
                              }
                              highlightOnline
        />
    );
});
