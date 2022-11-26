import React, {FunctionComponent} from "react";
import {Card, CardContent, CardHeader, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import {ChatParticipantsListItem} from "./ChatParticipantsListItem";
import {FetchingState} from "../../utils/types";

interface ChatParticipantsListProps {
    participantsIds: string[],
    highlightOnline?: boolean,
    fetchingState: FetchingState,
    label: string
}

const useStyles = makeStyles(() => createStyles({
    root: {
        paddingLeft: 0,
        paddingRight: 0
    },
    titleWrapper: {
        display: "flex"
    }
}));

export const ChatParticipantsList: FunctionComponent<ChatParticipantsListProps> = ({
    participantsIds,
    highlightOnline = false,
    fetchingState,
    label
}) => {
    const classes = useStyles();

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
                </div>
            )}/>
            <CardContent>
                {participantsIds.map(participantId => (
                    <ChatParticipantsListItem participantId={participantId}
                                              key={participantId}
                                              highlightOnline={highlightOnline}
                    />
                ))}
            </CardContent>
        </Card>
    );
};