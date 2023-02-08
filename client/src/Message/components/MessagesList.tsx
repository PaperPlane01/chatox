import React, {CSSProperties, Fragment, FunctionComponent, useLayoutEffect} from "react";
import {observer} from "mobx-react";
import {Theme, useMediaQuery, useTheme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {MessagesListItem} from "./MessagesListItem";
import {MessagesListBottom} from "./MessagesListBottom";
import {PinnedMessage} from "./PinnedMessage";
import {calculateMessagesListStyles} from "../utils";
import {useMessagesListRefs, useMessagesListStyles} from "../hooks";
import {useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    messagesList: {
        [theme.breakpoints.up("lg")]: {
            overflowY: "auto",
        },
        [theme.breakpoints.down("lg")]: {
            overflowY: "auto",
            overflowX: "auto"
        }
    }
}));

export const MessagesList: FunctionComponent = observer(() => {
    const {
        messagesOfChat: {
            messagesOfChat
        },
        messageCreation: {
            referredMessageId,
            emojiPickerExpanded
        },
        pinnedMessages: {
            currentPinnedMessageId,
            currentPinnedMessageIsClosed
        },
        chat: {
            selectedChatId
        }
    } = useStore();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
    const refs = useMessagesListRefs();
    const classes = useStyles();

    const calculateStyles = (): CSSProperties => calculateMessagesListStyles({
        refs,
        theme,
        onSmallScreen,
        referredMessageId,
        variant: "normal"
    });

    const style = useMessagesListStyles(
        calculateStyles,
        refs,
        [
            messagesOfChat,
            referredMessageId,
            onSmallScreen,
            emojiPickerExpanded,
            currentPinnedMessageId,
            currentPinnedMessageIsClosed
        ]
    );

    const scrollToBottom = (): void => {
        setTimeout(() => {
            if (refs.phantomBottomRef && refs.phantomBottomRef.current) {
                refs.phantomBottomRef.current.scrollIntoView();
            }
        }, 300);
    }

    useLayoutEffect(
        () => scrollToBottom(),
        [selectedChatId]
    );

    return (
        <Fragment>
            <PinnedMessage ref={refs.pinnedMessageRef}
                           width={refs.messagesListRef && refs.messagesListRef.current
                               ? refs.messagesListRef.current.getBoundingClientRect().width
                               : undefined
                           }
            />
            <div id="messagesList"
                 style={style}
                 ref={refs.messagesListRef}
                 className={classes.messagesList}
            >
                {messagesOfChat.map(messageId => (
                    <MessagesListItem messageId={messageId}
                                      key={messageId}
                    />
                ))}
                <div id="phantomBottom" ref={refs.phantomBottomRef}/>
            </div>
            <MessagesListBottom ref={refs.messagesListBottomRef}/>
        </Fragment>
    );
});