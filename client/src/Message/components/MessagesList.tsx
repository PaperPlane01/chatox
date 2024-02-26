import React, {
    CSSProperties,
    DependencyList,
    Fragment,
    FunctionComponent,
    UIEvent,
    useEffect,
    useLayoutEffect,
    useState
} from "react";
import {observer} from "mobx-react";
import {Theme, useMediaQuery, useTheme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {MessagesListItem} from "./MessagesListItem";
import {MessagesListBottom} from "./MessagesListBottom";
import {PinnedMessage} from "./PinnedMessage";
import {calculateMessagesListStyles} from "../utils";
import {useMessagesListBottomStyles, useMessagesListRefs, useMessagesListStyles} from "../hooks";
import {useStore} from "../../store";
import {isScrolledToBottom} from "../../utils/event-utils";
import {isWindowScrollable} from "../../utils/dom-utils";

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
            messagesOfChat,
            lastMessage
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
        },
        chatsPreferences: {
            enablePartialVirtualization,
            enableVirtualScroll
        }
    } = useStore();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
    const refs = useMessagesListRefs();
    const classes = useStyles();
    const [reachedBottom, setReachedBottom] = useState(false);
    const shouldHandleWindowScroll = onSmallScreen && (!enableVirtualScroll || enablePartialVirtualization);

    const calculateStyles = (): CSSProperties => calculateMessagesListStyles({
        refs,
        theme,
        onSmallScreen,
        referredMessageId,
        variant: "normal"
    });

    const styleDependencies: DependencyList = [
        messagesOfChat,
        referredMessageId,
        onSmallScreen,
        emojiPickerExpanded,
        currentPinnedMessageId,
        currentPinnedMessageIsClosed
    ]
    const style = useMessagesListStyles(
        calculateStyles,
        refs,
        styleDependencies
    );
    const messagesListBottomStyles = useMessagesListBottomStyles(
        onSmallScreen,
        styleDependencies
    );

    const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
        const scrolledToBottom = isScrolledToBottom(event);
        setReachedBottom(scrolledToBottom);
    };

    const handleWindowScroll = (): void => {
        if (shouldHandleWindowScroll) {
            const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
            const body = document.body;
            const html = document.documentElement;
            const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            const windowBottom = windowHeight + window.pageYOffset;

            setReachedBottom(documentHeight - windowBottom <= 1);
        }
    };

    const scrollToBottom = (): void => {
        setTimeout(() => {
            if (refs.phantomBottomRef?.current) {
                refs.phantomBottomRef.current.scrollIntoView();
            }
        }, 300);
    };

    useLayoutEffect(
        () => scrollToBottom(),
        [selectedChatId]
    );
    useLayoutEffect(
        () => {
            if (reachedBottom) {
                scrollToBottom();
            }
        },
        [lastMessage]
    );
    useEffect(() => {
        window.addEventListener("scroll", handleWindowScroll);

        return () => window.removeEventListener("scroll", handleWindowScroll);
    });

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
                 onScroll={handleScroll}
            >
                {messagesOfChat.map(messageId => (
                    <MessagesListItem messageId={messageId}
                                      key={messageId}
                    />
                ))}
                <div id="phantomBottom" ref={refs.phantomBottomRef}/>
            </div>
            <MessagesListBottom ref={refs.messagesListBottomRef}
                                style={messagesListBottomStyles}
            />
        </Fragment>
    );
});