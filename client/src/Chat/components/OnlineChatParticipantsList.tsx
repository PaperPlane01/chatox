import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {ChatParticipantsList} from "./ChatParticipantsList";
import {localized, Localized} from "../../localization";
import {FetchingState} from "../../utils/types";
import {MapMobxToProps} from "../../store";

interface OnlineChatParticipantsListMobxProps {
    onlineParticipants: string[],
    onlineParticipantsCount: number,
    getFetchingState: (chatId: string) => FetchingState,
    selectedChatId?: string
}

type OnlineChatParticipantsListProps = OnlineChatParticipantsListMobxProps & Localized;

const _OnlineChatParticipantsList: FunctionComponent<OnlineChatParticipantsListProps> = ({
    onlineParticipantsCount,
    selectedChatId,
    onlineParticipants,
    getFetchingState,
    l
}) => {
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
    )
};

const mapMobxToProps: MapMobxToProps<OnlineChatParticipantsListMobxProps> = ({
    chat,
    onlineChatParticipants
}) => ({
    selectedChatId: chat.selectedChatId,
    onlineParticipants: onlineChatParticipants.onlineParticipants,
    onlineParticipantsCount: onlineChatParticipants.onlineParticipantsCount,
    getFetchingState: onlineChatParticipants.getFetchingState
});

export const OnlineChatParticipantsList = localized(
    inject(mapMobxToProps)(observer(_OnlineChatParticipantsList))
) as FunctionComponent;
