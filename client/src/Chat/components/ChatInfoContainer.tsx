import React, {CSSProperties, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Theme} from "@mui/material";
import {createStyles, makeStyles, useTheme} from "@mui/styles";
import {ChatDescription} from "./ChatDescription";
import {VirtualScrollElement} from "../types";
import {ChatParticipantsCard, useChatParticipantsListScroll} from "../../ChatParticipant";

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

export const ChatInfoContainer: FunctionComponent = observer(() => {
    const classes = useStyles();
    const theme = useTheme<Theme>()
    const {
        onLargeScreen,
        enableVirtualScroll,
        scrollHandler,
        virtualScrollElement
    } = useChatParticipantsListScroll("online");
    const shouldHandleScroll = onLargeScreen && enableVirtualScroll
        && virtualScrollElement === VirtualScrollElement.MESSAGES_LIST;
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
