import React, {CSSProperties, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Theme, useMediaQuery} from "@mui/material";
import {createStyles, makeStyles, useTheme} from "@mui/styles";
import {ChatDescription} from "./ChatDescription";
import {VirtualScrollElement} from "../types";
import {OnlineChatParticipantsList} from "../../ChatParticipant";
import {useStore} from "../../store";

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
    const {
        chatsPreferences: {
            enableVirtualScroll,
            virtualScrollElement
        }
    } = useStore();
    const theme = useTheme<Theme>()
    const onLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
    const style: CSSProperties | undefined = onLargeScreen && enableVirtualScroll && virtualScrollElement === VirtualScrollElement.WINDOW
        ? ({
            position: "fixed",
            overflowY: "auto",
            top: theme.spacing(8),
            height: "100vh"
        })
        : undefined;


    return (
        <div className={classes.chatInfoContainer}
             style={style}
        >
            <ChatDescription/>
            <div className={classes.withPadding}>
                <OnlineChatParticipantsList/>
            </div>
        </div>
    );
});
