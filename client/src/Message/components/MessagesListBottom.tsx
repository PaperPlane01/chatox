import React, {forwardRef, ReactNode} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {format} from "date-fns";
import {CreateMessageForm} from "./CreateMessageForm";
import {JoinChatButton} from "../../Chat";
import {ChatParticipationEntity} from "../../Chat/types";
import {useAuthorization, useLocalization, useStore} from "../../store";
import {ChatBlockingEntity} from "../../ChatBlocking/types";
import {isChatBlockingActive} from "../../ChatBlocking/utils";
import {isStringEmpty} from "../../utils/string-utils";
import {UserEntity} from "../../User/types";
import {Labels, TranslationFunction} from "../../localization";


const useStyles = makeStyles((theme: Theme) => createStyles({
    messagesListBottom: {
        [theme.breakpoints.up("lg")]: {
            display: "inline-block",
            verticalAlign: "bottom",
            width: "100%",
        },
        [theme.breakpoints.down("md")]: {
            position: "fixed",
            bottom: 0,
            width: "100%",
            backgroundColor: theme.palette.background.default
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

const _MessagesListBottom = forwardRef<HTMLDivElement, {}>((props, ref) => {
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
            }
        },
        chat: {
            selectedChatId
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
                messagesListBottomContent = <CreateMessageForm/>
            }
        } else {
            messagesListBottomContent = <JoinChatButton/>;
        }
    } else {
        messagesListBottomContent = <div/>;
    }

    return (
        <div id="messagesListBottom"
             ref={ref}
             className={classes.messagesListBottom}
        >
            {messagesListBottomContent}
        </div>
    );
});

export const MessagesListBottom = observer(_MessagesListBottom);
