import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {ChatParticipantsList} from "./ChatParticipantsList";
import {ChatOfCurrentUserEntity} from "../types"
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";
import {PaginationState} from "../../utils/types";

interface AllChatParticipantsListMobxProps {
    participants: string[],
    selectedChatId?: string,
    onlineParticipantsCount: number,
    findChat: (chatId: string) => ChatOfCurrentUserEntity,
    getPaginationState: (chatId: string) => PaginationState
}

type AllChatParticipantsListProps = AllChatParticipantsListMobxProps & Localized;

const _AllChatParticipantsList: FunctionComponent<AllChatParticipantsListProps> = ({
    participants,
    onlineParticipantsCount,
    selectedChatId,
    findChat,
    getPaginationState,
    l
}) => {

    if (!selectedChatId) {
        return null;
    }

    const fetchingState = getPaginationState(selectedChatId);
    const chat = findChat(selectedChatId);

    return (
        <ChatParticipantsList participantsIds={participants}
                              fetchingState={fetchingState}
                              label={l(
                                  "chat.number-of-participants",
                                  {
                                      numberOfParticipants: chat.participantsCount,
                                      onlineParticipantsCount: onlineParticipantsCount
                                  })
                              }
        />
    )
};

const mapMobxToProps: MapMobxToProps<AllChatParticipantsListMobxProps> = ({
    entities,
    chatParticipants,
    onlineChatParticipants,
    chat
}) => ({
    participants: chatParticipants.chatParticipants,
    selectedChatId: chat.selectedChatId,
    findChat: entities.chats.findById,
    getPaginationState: chatParticipants.getPaginationState,
    onlineParticipantsCount: onlineChatParticipants.onlineParticipantsCount
});

export const AllChatParticipantsList = localized(
    inject(mapMobxToProps)(observer(_AllChatParticipantsList))
) as FunctionComponent;
