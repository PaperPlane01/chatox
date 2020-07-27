import React, {FunctionComponent, Fragment, ReactNode} from "react";
import {inject, observer} from "mobx-react";
import {Typography} from "@material-ui/core";
import {format} from "date-fns";
import {CreateMessageForm} from "./CreateMessageForm";
import {ReferredMessageCard} from "./ReferredMessageCard";
import {JoinChatButton} from "../../Chat";
import {ChatParticipationEntity} from "../../Chat/types";
import {CurrentUser} from "../../api/types/response";
import {MapMobxToProps} from "../../store";
import {FindChatParticipationByUserAndChatOptions} from "../../Chat";
import {ChatBlockingEntity} from "../../ChatBlocking/types";
import {isChatBlockingActive} from "../../ChatBlocking/utils";
import {isStringEmpty} from "../../utils/string-utils";
import {UserEntity} from "../../User/types";
import {localized, Localized, Labels, TranslationFunction} from "../../localization";

interface MessagesListBottomMobxProps {
    findChatParticipation: (options: FindChatParticipationByUserAndChatOptions) => ChatParticipationEntity | undefined,
    findChatBlocking: (id: string) => ChatBlockingEntity,
    findUser: (id: string) => UserEntity,
    currentUser?: CurrentUser,
    selectedChatId?: string
}

type MessagesListBottomProps = MessagesListBottomMobxProps & Localized;

const getBlockingLabel = (
    chatBlockingEntity: ChatBlockingEntity,
    blockedBy: UserEntity,
    l: TranslationFunction,
    dateFnsLocale: Locale
): string => {
    let labelCode: keyof Labels;
    let bindings: any = undefined;

    const blockedByUsername = `${blockedBy.firstName}${blockedBy.lastName ? `${ blockedBy.lastName}` : ""}`;
    const blockedUntil = format(
        chatBlockingEntity.blockedUntil,
        "dd MMMM yyyy HH:mm:ss",
        {locale: dateFnsLocale}
    );

    if (!isStringEmpty(chatBlockingEntity.description)) {
        labelCode = "chat.blocking.current-user-blocked.with-reason";
        bindings = {
            blockedByUsername,
            blockedUntil,
            reason: chatBlockingEntity.description
        };
    } else {
        labelCode = "chat.blocking.current-user-blocked.no-reason";
        bindings = {
            blockedByUsername,
            blockedUntil
        };
    }

    return l(labelCode, bindings);
};

const _MessagesListBottom: FunctionComponent<MessagesListBottomProps> = ({
    findChatParticipation,
    findChatBlocking,
    findUser,
    currentUser,
    selectedChatId,
    l,
    dateFnsLocale
}) => {
    let chatParticipation: ChatParticipationEntity | undefined;
    let activeChatBlocking: ChatBlockingEntity | undefined;
    let messagesListBottomContent: ReactNode;
    if (selectedChatId && currentUser) {
        chatParticipation = findChatParticipation({
            userId: currentUser.id,
            chatId: selectedChatId
        });

        if (chatParticipation) {
            if (chatParticipation.activeChatBlockingId) {
                const chatBlocking = findChatBlocking(chatParticipation.activeChatBlockingId);
                activeChatBlocking = isChatBlockingActive(chatBlocking) ? chatBlocking : undefined;
            }

            if (activeChatBlocking) {
                const blockedBy = findUser(activeChatBlocking.blockedById);
                messagesListBottomContent = (
                    <Typography>
                        <Typography color="primary">
                            {
                                getBlockingLabel(
                                    activeChatBlocking,
                                    blockedBy,
                                    l,
                                    dateFnsLocale
                                )
                            }
                        </Typography>
                    </Typography>
                );
            } else {
                messagesListBottomContent = (
                    <Fragment>
                        <ReferredMessageCard/>
                        <CreateMessageForm/>
                    </Fragment>
                );
            }
        } else {
            messagesListBottomContent = <JoinChatButton/>;
        }
    } else {
        messagesListBottomContent = <div/>;
    }

    return (
        <div id="messagesListBottom">
            {messagesListBottomContent}
        </div>
    );
};

const mapMobxToProps: MapMobxToProps<MessagesListBottomMobxProps> = ({entities, authorization, chat}) => ({
    findChatParticipation: entities.chatParticipations.findByUserAndChat,
    findChatBlocking: entities.chatBlockings.findById,
    findUser: entities.users.findById,
    currentUser: authorization.currentUser,
    selectedChatId: chat.selectedChatId
});

export const MessagesListBottom = localized(
    inject(mapMobxToProps)(observer(_MessagesListBottom))
) as FunctionComponent;
