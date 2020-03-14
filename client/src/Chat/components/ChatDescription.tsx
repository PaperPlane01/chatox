import React, {FunctionComponent} from "react";
import {observer, inject} from "mobx-react";
import {Card, CardContent, createStyles, makeStyles} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info"
import {Skeleton} from "@material-ui/lab";
import ReactMarkdown from "react-markdown";
import {ChatOfCurrentUserEntity} from "../types";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

const breaks = require("remark-breaks");

interface ChatDescriptionMobxProps {
    findChat: (chatId: string) => ChatOfCurrentUserEntity,
    selectedChatId?: string,
    pending: boolean
}

type ChatDescriptionProps = ChatDescriptionMobxProps & Localized;

const useStyles = makeStyles(() => createStyles({
    root: {
        paddingLeft: 0,
        paddingRight: 0
    }
}));

const _ChatDescription: FunctionComponent<ChatDescriptionProps> = ({
    findChat,
    selectedChatId,
    pending,
    l
}) => {
    const classes = useStyles();

    if (selectedChatId) {
        const chat = findChat(selectedChatId);

        return (
            <Card classes={{
                root: classes.root
            }}>
                <CardContent>
                    <InfoIcon/>
                    {pending
                        ? <Skeleton variant="text" width={60}/>
                        : (
                            <ReactMarkdown source={chat.description ? chat.description : l("chat.no-description")}
                                           plugins={[breaks]}
                            />
                        )
                    }
                </CardContent>
            </Card>
        )
    } else {
        return null;
    }
};

const mapMobxToProps: MapMobxToProps<ChatDescriptionMobxProps> = ({entities, chat}) => ({
    selectedChatId: chat.selectedChatId,
    findChat: entities.chats.findById,
    pending: chat.pending
});

export const ChatDescription = localized(
    inject(mapMobxToProps)(observer(_ChatDescription))
) as FunctionComponent;
