import React, {FunctionComponent, ReactNode, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, IconButton, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Close} from "@mui/icons-material";
import randomColor from "randomcolor";
import {useLocalization, useStore} from "../../store";
import {useEmojiParser} from "../../Emoji";

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
    messageId: string,
    icon?: ReactNode,
    onClose: () => void
}

export const MessageFormMessageCard: FunctionComponent<MessageFormMessageCardProps> = observer(({
    messageId,
    icon = null,
    onClose
}) => {
    const {
        chat: {
            selectedChatId
        },
        messageDialog: {
            setMessageId: setMessageDialogMessageId
        },
        entities: {
            messages: {
                findById: findMessage
            },
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const {parseEmoji} = useEmojiParser();

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

    if (!messageId || !selectedChatId) {
        return null;
    }

    const message = findMessage(messageId);

    if (message.chatId !== selectedChatId) {
        return null;
    }

    const user = findUser(message.sender);
    const color = randomColor({seed: user.id});

    return (
        <Card elevation={0}>
            <CardHeader title={
                <Typography variant="body1" style={{color}}>
                    <strong>
                        {user.firstName} {user.lastName && user.lastName}
                    </strong>
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
                {icon && icon}
                {message.deleted
                    ? <i>{l("message.deleted")}</i>
                    : parseEmoji(message.text, message.emoji)
                }
            </CardContent>
        </Card>
    );
});