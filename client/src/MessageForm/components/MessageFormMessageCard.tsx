import React, {FunctionComponent, ReactNode, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, IconButton, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles, useTheme} from "@mui/styles";
import {Close} from "@mui/icons-material";
import randomColor from "randomcolor";
import {getForwardMessagesLabel} from "../../Message/utils";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {MarkdownTextWithEmoji} from "../../Markdown";
import {getUserDisplayedName} from "../../User/utils/labels";

const useStyles = makeStyles((theme: Theme) => createStyles({
    cardContentRoot: {
        paddingTop: 0,
        paddingBottom: 0,
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        borderLeft: "4px solid",
        borderLeftColor: theme.palette.primary.main,
        cursor: "pointer",
        display: "flex",
        alignItems: "center"
    },
    cardHeaderRoot: {
        paddingLeft: theme.spacing(2),
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0
    }
}));

interface MessageFormMessageCardProps {
    messageId?: string,
    mode: "reply" | "forward" | "edit",
    icon?: ReactNode,
    messagesCount?: number,
    onClose: () => void
}

export const MessageFormMessageCard: FunctionComponent<MessageFormMessageCardProps> = observer(({
    messageId,
    icon = null,
    mode,
    messagesCount,
    onClose
}) => {
    const {
        chat: {
            selectedChatId
        },
        messageDialog: {
            setMessageId: setMessageDialogMessageId
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const theme = useTheme<Theme>();

    const messagesListElement = document.getElementById("messagesList");
    const messagesListWidth = messagesListElement
        ? messagesListElement.clientWidth
        : "100%";

    const [width, setWidth] = useState(messagesListWidth);

    const updateWidth = (): void => {
        const messagesListElement = document.getElementById("messagesList");
        setWidth(messagesListElement ? messagesListElement.clientWidth : "100%");
    };

    if (width === "100%") {
        setTimeout(updateWidth, 1);
    }

    useLayoutEffect(() => {
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const message = useEntityById("messages", messageId);
    const user = useEntityById("users", message?.sender);

    if (mode === "reply" && !messageId) {
        return null;
    }

    if (mode === "reply" && message && message.chatId !== selectedChatId) {
        return null;
    }

    let headerContent: ReactNode = null;
    let headerColor = theme.palette.primary.main;

    if (message && user) {
        headerContent = (
            <strong>
                {getUserDisplayedName(user)}
            </strong>
        );
        headerColor = randomColor({seed: user.id});
    } else if (mode === "forward") {
        headerContent = getForwardMessagesLabel(messagesCount, l);
    }

    let cardContent: ReactNode = null;

    if (message) {
        cardContent = message.deleted
                ? <i>{l("message.deleted")}</i>
                : (
                <MarkdownTextWithEmoji text={message.text}
                                       emojiData={message.emoji}
                                       renderParagraphsAsSpan
                                       renderHeadersAsPlainText
                                       renderQuotesAsPlainText
                                       renderLinksAsPlainText
                                       renderCodeAsPlainText
                />
            );
    } else if (mode === "forward") {
        cardContent = `[${getForwardMessagesLabel(messagesCount, l)}]`;
    }

    return (
        <Card elevation={0}>
            <CardHeader title={
                <Typography variant="body1" style={{color: headerColor}}>
                    {headerContent}
                </Typography>
            }
                        action={
                            <IconButton onClick={onClose} size="large">
                                <Close/>
                            </IconButton>
                        }
                        classes={{
                            root: classes.cardHeaderRoot
                        }}
            />
            <CardContent classes={{
                root: classes.cardContentRoot
            }}
                         style={{maxWidth: width}}
                         onClick={() => setMessageDialogMessageId(messageId)}
            >
                {icon}
                {cardContent}
            </CardContent>
        </Card>
    );
});
