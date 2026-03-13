import React, {CSSProperties, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Theme, useTheme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {ChatDescription} from "./ChatDescription";
import {ChatParticipantsCard, useChatParticipantsListScroll} from "../../ChatParticipant";

const useStyles = makeStyles()((theme: Theme) => ({
    chatInfoContainer: {
        height: "calc(100vh - 64px)",
        width: "100%",
        overflowY: "auto"
    },
    withPadding: {
        paddingTop: theme.spacing(2)
    }
}));

export const ChatInfoContainer: FunctionComponent = observer(() => {
    const {classes} = useStyles();
    const theme = useTheme<Theme>()
    const {
        onLargeScreen,
        enableVirtualScroll,
        scrollHandler,
    } = useChatParticipantsListScroll("online");
    const shouldHandleScroll = onLargeScreen && enableVirtualScroll;
    const style: CSSProperties | undefined = shouldHandleScroll
        ? ({
            overflowY: "auto",
            top: theme.spacing(8),
        })
        : ({
            position: "fixed",
            width: "21%"
        });

    return (
        <div className={classes.chatInfoContainer}
             style={style}
             onScroll={shouldHandleScroll ? scrollHandler : undefined}
        >
            <ChatDescription/>
            <div className={classes.withPadding}>
                <ChatParticipantsCard defaultMode="online"/>
            </div>
        </div>
    );
});
