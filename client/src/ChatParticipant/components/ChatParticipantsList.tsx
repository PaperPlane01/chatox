import React, {Fragment, FunctionComponent} from "react";
import {CircularProgress} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ChatParticipantsListItem} from "./ChatParticipantsListItem";
import {FetchingState} from "../../utils/types";
import {commonStyles} from "../../style";

interface ChatParticipantsListProps {
    participantsIds: string[],
    highlightOnline?: boolean,
    fetchingState: FetchingState
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

export const ChatParticipantsList: FunctionComponent<ChatParticipantsListProps> = ({
    participantsIds,
    highlightOnline = false,
    fetchingState,
}) => {
    const classes = useStyles();

    return (
        <Fragment>
            {participantsIds.map(participantId => (
                <ChatParticipantsListItem participantId={participantId}
                                          key={participantId}
                                          highlightOnline={highlightOnline}
                />
            ))}
            {fetchingState.pending && (
                <CircularProgress size={25} color="primary" className={classes.centered}/>
            )}
        </Fragment>
    );
};
