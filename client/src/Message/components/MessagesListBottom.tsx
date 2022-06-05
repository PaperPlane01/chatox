import React, {CSSProperties, forwardRef, ReactNode} from "react";
import {observer} from "mobx-react";
import {Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {format} from "date-fns";
import {CreateMessageForm} from "./CreateMessageForm";
import {JoinChatButton} from "../../Chat";
import {ChatParticipationEntity} from "../../Chat";
import {useAuthorization, useLocalization, useStore} from "../../store";
import {ChatBlockingEntity} from "../../ChatBlocking";
import {isChatBlockingActive} from "../../ChatBlocking/utils";
import {isStringEmpty} from "../../utils/string-utils";
import {UserEntity} from "../../User";
import {Labels, TranslationFunction} from "../../localization";
import {getGlobalBanLabel, isGlobalBanActive} from "../../GlobalBan/utils";

const useStyles = makeStyles((theme: Theme) => createStyles({
    messagesListBottom: {
        [theme.breakpoints.up("lg")]: {
            display: "inline-block",
            verticalAlign: "bottom",
            width: "100%",
        },
        [theme.breakpoints.down("lg")]: {
            position: "fixed",
            bottom: 0,
            width: "100%",
            backgroundColor: theme.palette.background.default,
            maxHeight: "70vh"
        }
    }
}));

const getBlockingLabel = (
    chatBlockingEntity: ChatBlockingEntity,
    blockedBy: UserEntity,
    l: TranslationFunction,
    dateFnsLocale: Locale
): string => {
    let labelCode: keyof Labels;
    let bindings: any;

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

const _MessagesListBottom = forwardRef<HTMLDivElement, {style?: CSSProperties}>((props, ref) => {
    const {
        entities: {
            chatParticipations: {
                findByUserAndChat: findChatParticipation
            },
            chatBlockings: {
                findById: findChatBlocking
            },
            users: {
                findById: findUser
            },
            chats: {
                findById: findChat
            },
            globalBans: {
                findById: findGlobalBan
            }
        },
        chat: {
            selectedChatId
        },
        messageCreation: {
            userId
        }
    } = useStore();
    const {l, dateFnsLocale} = useLocalization();
    const {currentUser} = useAuthorization();
    const classes = useStyles();

    let chatParticipation: ChatParticipationEntity | undefined;
    let activeChatBlocking: ChatBlockingEntity | undefined;
    let messagesListBottomContent: ReactNode;

    if (selectedChatId && currentUser) {
        chatParticipation = findChatParticipation({
            userId: currentUser.id,
            chatId: selectedChatId
        });
        const chat = findChat(selectedChatId);

        if (chat.deleted) {
            return null;
        }

        if (chatParticipation) {
            if (currentUser.globalBan && isGlobalBanActive(findGlobalBan(currentUser.globalBan.id))) {
                messagesListBottomContent = (
                    <Typography color="primary">
                        {
                            getGlobalBanLabel(
                                findGlobalBan(currentUser.globalBan.id),
                                l,
                                dateFnsLocale,
                                findUser
                            )
                        }
                    </Typography>
                )
            } else {
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
                    messagesListBottomContent = <CreateMessageForm/>
                }
            }
        } else {
            messagesListBottomContent = <JoinChatButton/>;
        }
    } else if (userId && currentUser) {
        messagesListBottomContent = <CreateMessageForm/>;
    } else {
        messagesListBottomContent = <div/>;
    }

    return (
        <div id="messagesListBottom"
             ref={ref}
             className={classes.messagesListBottom}
             style={props.style}
        >
            {messagesListBottomContent}
        </div>
    );
});

export const MessagesListBottom = observer(_MessagesListBottom);
