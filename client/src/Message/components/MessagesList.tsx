import React, {
    Fragment,
    FunctionComponent,
    RefObject,
    UIEvent,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import {observer} from "mobx-react";
import { Theme, useMediaQuery, useTheme } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import useResizeObserver from "@react-hook/resize-observer";
import {MessagesListItem} from "./MessagesListItem";
import {MessagesListBottom} from "./MessagesListBottom";
import {PinnedMessage} from "./PinnedMessage";
import {ReversedScrollHandler} from "../utils";
import {useStore} from "../../store";
import {ReverseScrollDirectionOption} from "../../Chat";

const useStyles = makeStyles((theme: Theme) => createStyles({
    messagesList: {
        [theme.breakpoints.up("lg")]: {
            overflowY: "auto",
        },
        [theme.breakpoints.down('lg')]: {
            overflowY: "auto",
            overflowX: "auto"
        }
    }
}));

interface MessagesListStyles {
    height: string | number,
    paddingBottom: number,
    paddingTop: number,
    transform?: string
}

const virtuosoScrollHandler = new ReversedScrollHandler();

export const MessagesList: FunctionComponent = observer(() => {
    const {
        messagesOfChat: {
            messagesOfChat,
            firstMessage,
            lastMessage,
            messagesListReverted,
            isInSearchMode,
            fetchMessages
        },
        messageCreation: {
            referredMessageId,
            emojiPickerExpanded,
            userId
        },
        chatsPreferences: {
            enableVirtualScroll,
            virtualScrollOverscan,
            restoredScrollingSpeedCoefficient,
            reverseScrollingDirectionOption
        },
        chat: {
            selectedChatId,
            selectedChat
        },
        pinnedMessages: {
            currentPinnedMessageId,
            currentPinnedMessageIsClosed
        },
        messagesListScrollPositions: {
            getScrollPosition,
            setScrollPosition,
            getReachedBottom,
            setReachedBottom
        }
    } = useStore();
    const theme = useTheme();
    const phantomBottomRef = useRef<HTMLDivElement>(null);
    const messagesListBottomRef = useRef<HTMLDivElement>(null);
    const classes = useStyles();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const virtuosoRef = useRef<VirtuosoHandle>() as RefObject<VirtuosoHandle>
    const messagesDivRef = useRef<HTMLDivElement>(null);
    const pinnedMessageRef = useRef<HTMLDivElement>(null);

    const calculateStyles = (): MessagesListStyles => {
        let height: string | number;
        let paddingBottom: number = 0;
        let paddingTop: number = 0;
        let transform: string | undefined = undefined;

        if (enableVirtualScroll && reverseScrollingDirectionOption !== ReverseScrollDirectionOption.DO_NOT_REVERSE) {
            transform = "scaleY(-1)"
        }

        if (onSmallScreen) {
            if (enableVirtualScroll) {
                if (messagesListBottomRef && messagesListBottomRef.current) {
                    let heightToSubtract = Number(theme.spacing(7).replace("px", "")) + messagesListBottomRef.current.getBoundingClientRect().height;

                    if (pinnedMessageRef && pinnedMessageRef.current) {
                        heightToSubtract = pinnedMessageRef.current.getBoundingClientRect().height;
                    }

                    height = window.innerHeight - heightToSubtract;
                } else {
                    height = `calc(100vh - ${referredMessageId ? 238 : 154}px)`;
                }
            } else {
                height = "100%";

                if (messagesListBottomRef && messagesListBottomRef.current) {
                    paddingBottom = messagesListBottomRef.current.getBoundingClientRect().height;
                }

                if (pinnedMessageRef && pinnedMessageRef.current) {
                    paddingTop = pinnedMessageRef.current.getBoundingClientRect().height;
                }
            }
        } else {
            if (messagesListBottomRef && messagesListBottomRef.current) {
                let heightToSubtract = Number(theme.spacing(8).replace("px", ""))
                    + messagesListBottomRef.current.getBoundingClientRect().height + Number(theme.spacing(2).replace("px", ""));

                if (pinnedMessageRef && pinnedMessageRef.current) {
                    heightToSubtract = heightToSubtract + pinnedMessageRef.current.getBoundingClientRect().height;
                }

                height = window.innerHeight - heightToSubtract;
            } else {
                height = `calc(100vh - ${referredMessageId ? 238 : 154}px)`;
            }
        }

        return {height, paddingBottom, paddingTop, transform};
    };

    const [styles, setStyles] = useState(calculateStyles());

    const scrollToBottom = (): void => {
        setTimeout(
            () => {
                if (enableVirtualScroll && virtuosoRef && virtuosoRef.current) {
                    // OK so cascading setTimeout here feels incredibly broken,
                    // but without it it just stays in place and doesn't follow
                    // new messages. IDK why the hell this is happening,
                    // and this is the only work around that I've found
                    if (reverseScrollingDirectionOption === ReverseScrollDirectionOption.DO_NOT_REVERSE) {
                        setTimeout(() => virtuosoRef!.current!.scrollToIndex(messagesOfChat.length - 1));
                    } else {
                        setTimeout(() => virtuosoRef!.current!.scrollToIndex(0));
                    }
                } else {
                    if (phantomBottomRef && phantomBottomRef.current) {
                        phantomBottomRef.current.scrollIntoView();
                    }
                }
            }
        )
    };

    const handleDivScroll = (event: UIEvent<HTMLElement>): void => {
        const coveredDistance = event.currentTarget.scrollHeight - event.currentTarget.scrollTop;
        setScrollPosition(selectedChatId!, event.currentTarget.scrollTop);

        if (messagesListReverted) {
            setReachedBottom(selectedChatId!, event.currentTarget.scrollTop === 0);
        } else {
            setReachedBottom(selectedChatId!, coveredDistance - event.currentTarget.clientHeight <= 1);
        }

        if (!enableVirtualScroll) {
            if (event.currentTarget.scrollTop === 0) {
                const scrollableDiv = event.currentTarget;
                const previousHeight = scrollableDiv.scrollHeight;

                fetchMessages().then(() => {
                    if (messagesDivRef && messagesDivRef.current) {
                        const currentHeight = messagesDivRef.current.scrollHeight;
                        messagesDivRef.current.scrollTo({top: currentHeight - previousHeight});
                    }
                })
            }
        }
    };

    const handleWindowScroll = (): void => {
        if (!enableVirtualScroll) {
            const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
            const body = document.body;
            const html = document.documentElement;
            const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            const windowBottom = windowHeight + window.pageYOffset;

            setReachedBottom(selectedChatId!, documentHeight - windowBottom <= 1);
            setScrollPosition(selectedChatId!, window.scrollY);

            if (window.scrollY === 0) {
                const previousHeight = window.document.documentElement.scrollHeight;

                fetchMessages().then(() => {
                    const currentHeight = window.document.documentElement.scrollHeight;
                    window.document.documentElement.scrollTo({top: currentHeight - previousHeight})
                })
            }
        }
    };

    useEffect(
        () => {
            if (selectedChatId && getReachedBottom(selectedChatId)) {
                scrollToBottom();
            }
    },
        [messagesOfChat, emojiPickerExpanded]
    );
    useEffect(() => {
        const handleResize = () => {
            setStyles(calculateStyles());
            if (selectedChatId && getReachedBottom(selectedChatId)) {
                scrollToBottom();
            }
        };

        document.addEventListener("scroll", handleWindowScroll)
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("scroll", handleWindowScroll);
            window.removeEventListener("resize", handleResize);
        };
    });
    useLayoutEffect(
        () => setStyles(calculateStyles()),
        [
            messagesOfChat,
            referredMessageId,
            onSmallScreen,
            emojiPickerExpanded,
            currentPinnedMessageId,
            currentPinnedMessageIsClosed
        ]
    );
    useResizeObserver(messagesListBottomRef, () => setStyles(calculateStyles()));
    useEffect(() => {
        if (!selectedChatId) {
            return;
        }

        const scrollPosition = getScrollPosition(selectedChatId);

        if (scrollPosition !== undefined) {
            if (virtuosoRef && virtuosoRef.current) {
                // We have to use setTimeout here because without it it just sticks at top
                // It still sticks at top for a brief moment but then correctly scrolls to required position
                setTimeout(() => virtuosoRef!.current!.scrollTo({top: scrollPosition}))
            } else if (onSmallScreen) {
                window.scrollTo({top: scrollPosition});
            } else if (messagesDivRef && messagesDivRef.current) {
                messagesDivRef.current.scrollTo({top: scrollPosition});
            }
        } else {
            scrollToBottom();
        }
    }, [selectedChatId])
    useEffect(
        () => {
            if (!selectedChatId) {
               return;
            }

            if (getReachedBottom(selectedChatId)) {
                scrollToBottom();
            }
        },
        [messagesOfChat]
    );
    useLayoutEffect(
        () => {
            if (messagesDivRef && messagesDivRef.current) {
                const messagesListDiv = messagesDivRef.current;

                if (messagesListDiv) {
                    const virtuosoDiv = messagesListDiv.children[0];

                    if (virtuosoDiv) {
                        virtuosoDiv.addEventListener("wheel", event => {
                            if (reverseScrollingDirectionOption === ReverseScrollDirectionOption.REVERSE_AND_TRY_TO_RESTORE) {
                                event.preventDefault();
                                virtuosoScrollHandler.handleScroll(
                                    virtuosoDiv,
                                    event as WheelEvent,
                                    restoredScrollingSpeedCoefficient
                                )
                            }
                        }, {
                            passive: false
                        });
                    }
                }
            }
        },
        [messagesDivRef]
    );

    if (!selectedChat) {
        if (userId) {
            return (
                <Fragment>
                    <div className={classes.messagesList}
                         id="messagesList"
                         style={styles}
                         ref={messagesDivRef}
                    />
                    <MessagesListBottom ref={messagesListBottomRef}/>
                </Fragment>
            );
        } else {
            return null;
        }
    }

    if (!enableVirtualScroll || !lastMessage) {
        return (
            <Fragment>
                <PinnedMessage ref={pinnedMessageRef}
                               width={messagesDivRef && messagesDivRef.current ? messagesDivRef.current.getBoundingClientRect().width : undefined}
                />
                <div className={classes.messagesList}
                     onScroll={handleDivScroll}
                     id="messagesList"
                     style={styles}
                     ref={messagesDivRef}
                >
                    {messagesOfChat.map(messageId => (
                        <MessagesListItem messageId={messageId}
                                          key={messageId}
                        />
                    ))}
                    <div id="phantomBottom" ref={phantomBottomRef}/>
                </div>
                <MessagesListBottom ref={messagesListBottomRef}/>
            </Fragment>
        )
    } else {
        if (!lastMessage) {
            return null;
        }

        return (
           <Fragment>
               <PinnedMessage ref={pinnedMessageRef}
                              width={messagesDivRef && messagesDivRef.current ? messagesDivRef.current.getBoundingClientRect().width : undefined}
               />
               <div id="messagesList"
                    ref={messagesDivRef}
               >
                   <Virtuoso totalCount={isInSearchMode ? messagesOfChat.length : (lastMessage && lastMessage.index)}
                             data={messagesOfChat}
                             itemContent={index => {
                                 let correctedIndex = messagesListReverted
                                     ? (isInSearchMode ? messagesOfChat.length - index + 1 : lastMessage!.index - index + 1)
                                     : index;

                                 const messageId = isInSearchMode
                                     ? messagesOfChat[correctedIndex]
                                     : selectedChat.indexToMessageMap[correctedIndex]

                                 if (!messageId) {
                                     return <div style={{height: 1}}/>
                                 }

                                 return (
                                     <MessagesListItem messageId={messageId}
                                                       inverted={reverseScrollingDirectionOption !== ReverseScrollDirectionOption.DO_NOT_REVERSE}
                                                       messagesListHeight={typeof styles.height === "number" ? styles.height : undefined}
                                     />
                                 )
                             }}
                             overscan={virtualScrollOverscan}
                             style={styles}
                             ref={virtuosoRef}
                             computeItemKey={index => messagesOfChat[index]}
                             onScroll={(event: any) => handleDivScroll(event)}
                             firstItemIndex={isInSearchMode ? 0 : (firstMessage && firstMessage.index)}
                             startReached={() => !messagesListReverted && fetchMessages()}
                             endReached={() => messagesListReverted && fetchMessages()}
                   />
                   <MessagesListBottom ref={messagesListBottomRef}/>
               </div>
           </Fragment>
        );
    }
});
