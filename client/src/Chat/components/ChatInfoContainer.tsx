import React, {FunctionComponent} from "react";
import {Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ChatDescription} from "./ChatDescription";
import {OnlineChatParticipantsList} from "./OnlineChatParticipantsList";

const useStyles = makeStyles((theme: Theme) => createStyles({
    chatInfoContainer: {
        height: "calc(100vh - 64px)",
        width: "100%",
        overflowY: "auto"
    },
    withPadding: {
        paddingTop: theme.spacing(2)
    }
}));

export const ChatInfoContainer: FunctionComponent = () => {
    const classes = useStyles();

    return (
        <div className={classes.chatInfoContainer}>
            <ChatDescription/>
            <div className={classes.withPadding}>
                <OnlineChatParticipantsList/>
            </div>
        </div>
    );
};
