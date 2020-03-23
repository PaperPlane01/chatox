import React, {FunctionComponent, ReactNode} from "react";
import {inject, observer} from "mobx-react";
import {CreateMessageForm} from "./CreateMessageForm";
import {JoinChatButton} from "../../Chat";
import {ChatParticipationEntity} from "../../Chat/types";
import {CurrentUser} from "../../api/types/response";
import {MapMobxToProps} from "../../store";
import {FindChatParticipationByUserAndChatOptions} from "../../Chat";

interface MessagesListBottomMobxProps {
    findChatParticipation: (options: FindChatParticipationByUserAndChatOptions) => ChatParticipationEntity | undefined,
    currentUser?: CurrentUser,
    selectedChatId?: string
}

const _MessagesListBottom: FunctionComponent<MessagesListBottomMobxProps> = ({
    findChatParticipation,
    currentUser,
    selectedChatId
}) => {
    let chatParticipation: ChatParticipationEntity | undefined;
    let messagesListBottomContent: ReactNode;
    if (selectedChatId && currentUser) {
        chatParticipation = findChatParticipation({
            userId: currentUser.id,
            chatId: selectedChatId
        });

        if (chatParticipation) {
            messagesListBottomContent = <CreateMessageForm/>
        } else {
            messagesListBottomContent = <JoinChatButton/>
        }
    } else {
        messagesListBottomContent = <div/>
    }

    return (
        <div id="messagesListBottom">
            {messagesListBottomContent}
        </div>
    );
};

const mapMobxToProps: MapMobxToProps<MessagesListBottomMobxProps> = ({entities, authorization, chat}) => ({
    findChatParticipation: entities.chatParticipations.findByUserAndChat,
    currentUser: authorization.currentUser,
    selectedChatId: chat.selectedChatId
});

export const MessagesListBottom = inject(mapMobxToProps)(observer(_MessagesListBottom) as FunctionComponent);
