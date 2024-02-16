import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ChatVisibilityCard} from "./ChatVisibilityCard";
import {JoinChatAllowanceCard} from "./JoinChatAllowanceCard";
import {BaseSettingsTabProps} from "../../utils/types";

const useStyles = makeStyles((theme: Theme) => createStyles({
    securityTabContent: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2)
    }
}))

export const ChatSecurityTabContent: FunctionComponent<BaseSettingsTabProps> = observer(() => {
    const classes = useStyles();

    return (
        <div className={classes.securityTabContent}>
            <JoinChatAllowanceCard/>
            <ChatVisibilityCard/>
        </div>
    );
});
