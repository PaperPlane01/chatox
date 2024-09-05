import React, {CSSProperties, forwardRef, ReactNode} from "react";
import {observer} from "mobx-react";
import {Alert, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {format} from "date-fns";
import {MessageForm} from "../../MessageForm";
import {JoinChatButton, useChatParticipation} from "../../ChatParticipant";
import {useAuthorization, useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {ChatBlockingEntity} from "../../ChatBlocking";
import {isChatBlockingActive} from "../../ChatBlocking/utils";
import {isStringEmpty} from "../../utils/string-utils";
import {UserEntity} from "../../User";
import {Labels, TranslationFunction} from "../../localization";
import {getGlobalBanLabel, isGlobalBanActive} from "../../GlobalBan/utils";
import {getUserDisplayedName} from "../../User/utils/labels";

const useStyles = makeStyles<Theme>((theme: Theme) => createStyles({
    messagesListBottom: {
        [theme.breakpoints.up("lg")]: {
            display: "inline-block",
            verticalAlign: "bottom",
            width: "100%"
        },
        [theme.breakpoints.down("lg")]: {
            bottom: 0,
            width: "100%",
            backgroundColor: theme.palette.background.default,
            maxHeight: "70vh",
            minHeight: 45,
            overflow: "hidden"
        }
    }
}));

const getBlockingLabel = (
    chatBlockingEntity: ChatBlockingEntity,
    blockedBy: UserEntity, // TODO: make this parameter optional
    l: TranslationFunction,
    dateFnsLocale: Locale
): string => {
    let labelCode: keyof Labels;
    let bindings: any;

    const blockedByUsername = getUserDisplayedName(blockedBy);
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

interface MessagesListBottomProps {
    style?: CSSProperties
}

const _MessagesListBottom = forwardRef<HTMLDivElement, MessagesListBottomProps>((props, ref) => {
    const {
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

    const chat = useEntityById("chats", selectedChatId);
    const chatParticipation = useChatParticipation(selectedChatId, currentUser?.id)
    const lastChatBlocking = useEntityById("chatBlockings", chatParticipation?.activeChatBlockingId);
    const blockedInChatBy = useEntityById("users", lastChatBlocking?.blockedById);
    const globalBan = useEntityById("globalBans", currentUser?.globalBan?.id);
    const globalBanCreatedBy = useEntityById("users", globalBan?.createdById);
    let messagesListBottomContent: ReactNode;

    if (chat && currentUser) {
        if (chat.deleted) {
            return null;
        }

        if (chatParticipation) {
            if (globalBan && isGlobalBanActive(globalBan) && globalBanCreatedBy) {
                messagesListBottomContent = (
                    <Alert severity="error">
                        {
                            getGlobalBanLabel(
                                globalBan,
                                l,
                                dateFnsLocale,
                                globalBanCreatedBy
                            )
                        }
                    </Alert>
                );
            } else if (lastChatBlocking && isChatBlockingActive(lastChatBlocking) && blockedInChatBy) {
                messagesListBottomContent = (
                    <Alert severity="error">
                        {
                            getBlockingLabel(
                                lastChatBlocking,
                                blockedInChatBy,
                                l,
                                dateFnsLocale
                            )
                        }
                    </Alert>
                );
            } else {
                messagesListBottomContent = <MessageForm/>;
            }
        } else {
            messagesListBottomContent = <JoinChatButton/>;
        }
    } else if (userId && currentUser) {
        messagesListBottomContent = <MessageForm/>;
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
