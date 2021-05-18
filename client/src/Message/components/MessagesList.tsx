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
import {createStyles, makeStyles, Theme, useMediaQuery, useTheme} from "@material-ui/core";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import useResizeObserver from "@react-hook/resize-observer";
import {MessagesListItem} from "./MessagesListItem";
import {MessagesListBottom} from "./MessagesListBottom";
import {PinnedMessage} from "./PinnedMessage";
import {ReversedScrollHandler} from "../utils";
import {useStore} from "../../store";
import {ReverseScrollDirectionOption} from "../../Chat/types";

const useStyles = makeStyles((theme: Theme) => createStyles({
    messagesList: {
        [theme.breakpoints.up("lg")]: {
            overflowY: "auto",
        },
        [theme.breakpoints.down("md")]: {
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
            messagesOfChat
        },
        messageCreation: {
            referredMessageId,
            emojiPickerExpanded
        },
        chatsPreferences: {
            enableVirtualScroll,
            virtualScrollOverscan,
            restoredScrollingSpeedCoefficient,
            reverseScrollingDirectionOption
        },
        chat: {
            selectedChatId,
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
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
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
                    let heightToSubtract = theme.spacing(7) + messagesListBottomRef.current.getBoundingClientRect().height;

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
                let heightToSubtract = theme.spacing(8) + messagesListBottomRef.current.getBoundingClientRect().height + theme.spacing(2);

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
        setReachedBottom(selectedChatId!, coveredDistance - event.currentTarget.clientHeight <= 1);
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
        }
    };

    useEffect(
        () => setReachedBottom(selectedChatId!, false),
        [selectedChatId]
    );
    useEffect(
        () => {
            if (getReachedBottom(selectedChatId!)) {
                scrollToBottom();
            }
    },
        [messagesOfChat, emojiPickerExpanded]
    );
    useEffect(() => {
        const handleResize = () => {
            setStyles(calculateStyles());
            if (getReachedBottom(selectedChatId!)) {
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
    useEffect(
        () => {
            if (selectedChatId) {
                const scrollPosition = getScrollPosition(selectedChatId);

                if (scrollPosition !== undefined) {
                    if (virtuosoRef && virtuosoRef.current) {
                        // We have to use setTimeout here because without it it just sticks at top
                        // It still sticks at top for a brief moment but then correctly scrolls to required position
                        setTimeout(() => virtuosoRef!.current!.scrollTo({top: scrollPosition}))
                    } else if (onSmallScreen) {
                        console.log("Scrolling to window")
                        window.scrollTo({top: scrollPosition});
                    } else if (messagesDivRef && messagesDivRef.current) {
                        messagesDivRef.current.scrollTo({top: scrollPosition});
                    }
                } else {
                    scrollToBottom();
                }
            }
        },
        [selectedChatId, messagesOfChat]
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

    if (!enableVirtualScroll) {
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
        return (
           <Fragment>
               <PinnedMessage ref={pinnedMessageRef}
                              width={messagesDivRef && messagesDivRef.current ? messagesDivRef.current.getBoundingClientRect().width : undefined}
               />
               <div id="messagesList"
                    ref={messagesDivRef}
               >
                   <Virtuoso totalCount={messagesOfChat.length}
                             itemContent={index => (
                                 <MessagesListItem messageId={messagesOfChat[index]}
                                                   inverted={reverseScrollingDirectionOption !== ReverseScrollDirectionOption.DO_NOT_REVERSE}
                                                   messagesListHeight={typeof styles.height === "number" ? styles.height : undefined}
                                 />
                             )}
                             style={styles}
                             defaultItemHeight={120}
                             overscan={virtualScrollOverscan}
                             ref={virtuosoRef}
                             computeItemKey={index => messagesOfChat[index]}
                             onScroll={(event: any) => handleDivScroll(event)}
                   />
                   <MessagesListBottom ref={messagesListBottomRef}/>
               </div>
           </Fragment>
        )
    }
});
