import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Card, CardContent, CardHeader, createStyles, makeStyles, Typography} from "@material-ui/core";
import GroupOutlinedIcon from "@material-ui/icons/GroupOutlined";
import {ChatParticipantsListItem} from "./ChatParticipantsListItem";
import {ChatOfCurrentUserEntity} from "../types"
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";
import {PaginationState} from "../../utils/types";

interface ChatParticipantsListMobxProps {
    participants: string[],
    selectedChatId?: string,
    findChat: (chatId: string) => ChatOfCurrentUserEntity,
    getPaginationState: (chatId: string) => PaginationState
}

type ChatParticipantsListProps = ChatParticipantsListMobxProps & Localized;

const useStyles = makeStyles(() => createStyles({
    root: {
        paddingLeft: 0,
        paddingRight: 0
    },
    titleWrapper: {
        display: "flex"
    }
}));

const _ChatParticipangsList: FunctionComponent<ChatParticipantsListProps> = ({
    participants,
    selectedChatId,
    findChat,
    getPaginationState,
    l
}) => {
    const classes = useStyles();

    if (!selectedChatId) {
        return null;
    }

    const pending = getPaginationState(selectedChatId);
    const chat = findChat(selectedChatId);

    return (
        <Card classes={{
            root: classes.root
        }}>
            <CardHeader title={(
                <div className={classes.titleWrapper}>
                    <GroupOutlinedIcon/>
                    <Typography variant="body1">
                        <strong>
                            {l("chat.number-of-participants", {numberOfParticipants: chat.participantsCount})}
                        </strong>
                    </Typography>
                </div>
            )}/>
            <CardContent>
                {participants.map(participantId => (
                    <ChatParticipantsListItem participantId={participantId} key={participantId}/>
                ))}
            </CardContent>
        </Card>
    )
};

const mapMobxToProps: MapMobxToProps<ChatParticipantsListMobxProps> = ({entities, chatParticipants, chat}) => ({
    participants: chatParticipants.chatParticipants,
    selectedChatId: chat.selectedChatId,
    findChat: entities.chats.findById,
    getPaginationState: chatParticipants.getPaginationState
});

export const ChatParticipantsList = localized(
    inject(mapMobxToProps)(observer(_ChatParticipangsList))
) as FunctionComponent;
