import React, {FunctionComponent} from "react";
import {Typography, createStyles, makeStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => createStyles({
    messagesList: {
        height: "calc(100vh - 166px)",
        overflowY: "auto"
    }
}));

export const MessagesList: FunctionComponent = () => {
    const classes = useStyles();

    return (
        <div className={classes.messagesList}>
            <Typography variant="body1"
                        color="textSecondary"
            >
                Messages list is under development
            </Typography>
        </div>
    );
};
