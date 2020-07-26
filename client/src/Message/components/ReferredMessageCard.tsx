import React, {FunctionComponent, useLayoutEffect, useState} from "react";
import {inject, observer} from "mobx-react";
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
import randomColor from "randomcolor";
import {MessageEntity} from "../types";
import {UserEntity} from "../../User";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface ReferredMessageCardMobxProps {
    referredMessageId?: string,
    selectedChatId?: string,
    setReferredMessageId: (referredMessageId?: string) => void,
    setMessageDialogMessageId: (messageId?: string) => void,
    findMessage: (id: string) => MessageEntity,
    findUser: (id: string) => UserEntity,
}

type ReferredMessageCardProps = ReferredMessageCardMobxProps & Localized;

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

const _ReferredMessageCard: FunctionComponent<ReferredMessageCardProps> = ({
    referredMessageId,
    selectedChatId,
    setReferredMessageId,
    setMessageDialogMessageId,
    findMessage,
    findUser,
    l
}) => {
    const classes = useStyles();

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
        <Card>
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
                    : message.text
                }
            </CardContent>
        </Card>
    )
};

const mapMobxToProps: MapMobxToProps<ReferredMessageCardMobxProps> = ({
    messageCreation,
    chat,
    entities,
    messageDialog
}) => ({
    referredMessageId: messageCreation.referredMessageId,
    setReferredMessageId: messageCreation.setReferredMessageId,
    selectedChatId: chat.selectedChatId,
    findMessage: entities.messages.findById,
    findUser: entities.users.findById,
    setMessageDialogMessageId: messageDialog.setMessageId
});

export const ReferredMessageCard = localized(
    inject(mapMobxToProps)(observer(_ReferredMessageCard))
) as FunctionComponent;
