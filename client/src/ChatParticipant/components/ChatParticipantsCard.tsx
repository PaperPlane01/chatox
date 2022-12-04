import React, {FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {TranslationFunction} from "../../localization";
import {commonStyles} from "../../style";
import {useLocalization, useStore} from "../../store";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import {ChatParticipantSearchButton} from "./ChatParticipantSearchButton";
import {ChatParticipantSearchTextField} from "./ChatParticipantSearchTextField";
import {AllChatParticipantsList} from "./AllChatParticipantsList";
import {OnlineChatParticipantsList} from "./OnlineChatParticipantsList";
import {SearchChatParticipantsList} from "./SearchChatParticipantsList";
import {ChatOfCurrentUserEntity} from "../../Chat";

type ChatParticipantsListMode = "all" | "online" | "search";

const ChatParticipantsLists: Record<ChatParticipantsListMode, ReactNode> = {
    all: <AllChatParticipantsList/>,
    online: <OnlineChatParticipantsList/>,
    search: <SearchChatParticipantsList/>
}

interface ChatParticipantsCardProps {
    defaultMode: ChatParticipantsListMode
}

const useStyles = makeStyles(() => createStyles({
    root: {
        paddingLeft: 0,
        paddingRight: 0
    },
    titleWrapper: {
        display: "flex",
        alignItems: "center"
    },
    centered: commonStyles.centered,
    searchButton: {
        marginLeft: "auto",
        marginRight: 0
    }
}));

interface GetLabelParameters {
    chat: ChatOfCurrentUserEntity,
    mode: ChatParticipantsListMode,
    onlineParticipantsCount: number,
    l: TranslationFunction
}

const getLabel = (parameters: GetLabelParameters): string => {
    const {chat, mode, onlineParticipantsCount, l} = parameters;

    switch (mode) {
        case "all":
            return l(
                "chat.number-of-participants",
                {
                    numberOfParticipants: chat.participantsCount,
                    onlineParticipantsCount: `${onlineParticipantsCount}`
                });
        case "online":
            return l(
                "chat.online-participants-count",
                {onlineParticipantsCount: `${onlineParticipantsCount}`}
            );
        case "search":
            return l("chat.participants.search");
    }
}

export const ChatParticipantsCard: FunctionComponent<ChatParticipantsCardProps> = observer(({
    defaultMode
}) => {
    const {
        chat: {
            selectedChat
        },
        chatParticipantsSearch: {
            isInSearchMode
        },
        onlineChatParticipants: {
            onlineParticipantsCount
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    if (!selectedChat) {
        return null;
    }

    const mode: ChatParticipantsListMode = isInSearchMode ? "search" : defaultMode;
    const label = getLabel({
        chat: selectedChat,
        mode,
        onlineParticipantsCount,
        l
    })

    return (
        <Card classes={{
            root: classes.root
        }}>
            <CardHeader title={(
                <div className={classes.titleWrapper}>
                    <GroupOutlinedIcon/>
                    <Typography variant="body1">
                        <strong>
                            {label}
                        </strong>
                    </Typography>
                    <div className={classes.searchButton}>
                        <ChatParticipantSearchButton/>
                    </div>
                </div>
            )}/>
            <CardContent>
                <ChatParticipantSearchTextField/>
                {ChatParticipantsLists[mode]}
            </CardContent>
        </Card>
    );
})