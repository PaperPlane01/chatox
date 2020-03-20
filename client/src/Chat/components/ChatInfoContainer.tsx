import React, {FunctionComponent} from "react";
import {createStyles, makeStyles, Theme} from "@material-ui/core";
import {ChatDescription} from "./ChatDescription";
import {ChatParticipantsList} from "./ChatParticipantsList";

const useStyles = makeStyles((theme: Theme) => createStyles({
    chatInfoContainer: {
        height: "calc(100vh - 80px)",
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
                <ChatParticipantsList/>
            </div>
        </div>
    );
};
