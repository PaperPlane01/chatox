import React, {FunctionComponent, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import {
    Card,
    CardContent,
    CardHeader,
    createStyles,
    IconButton,
    makeStyles,
    Theme,
    Typography
} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {Data} from "emoji-mart";
import appleData from "emoji-mart/data/apple.json";
import randomColor from "randomcolor";
import {useLocalization, useStore} from "../../store";
import {parseEmojis} from "../../utils/parse-emojis";
import {useEmojiParser} from "../../emoji/hooks";

const useStyles = makeStyles((theme: Theme) => createStyles({
    cardContentRoot: {
        paddingTop: 0,
        paddingBottom: 0,
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        borderLeft: "4px solid",
        borderLeftColor: theme.palette.primary.main,
        cursor: "pointer"
    },
    cardHeaderRoot: {
        paddingLeft: theme.spacing(2),
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0
    }
}));

export const ReferredMessageCard: FunctionComponent = observer(() => {
    const {
        messageCreation: {
            referredMessageId,
            setReferredMessageId
        },
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

    if (!referredMessageId || !selectedChatId) {
        return null;
    }

    const message = findMessage(referredMessageId);

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
                            <IconButton onClick={() => setReferredMessageId(undefined)}>
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
                         onClick={() => setMessageDialogMessageId(referredMessageId)}
            >
                {message.deleted
                    ? <i>{l("message.deleted")}</i>
                    : parseEmoji(message.text, message.emoji)
                }
            </CardContent>
        </Card>
    )
});
