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
import {Virtuoso, VirtuosoMethods} from "react-virtuoso";
import {MessagesListItem} from "./MessagesListItem";
import {MessagesListBottom} from "./MessagesListBottom";
import {ReversedScrollHandler, VirtuosoInitialTopMostItemHandler} from "../utils";
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
    transform?: string
}

const virtuosoTopMostItemHandler = new VirtuosoInitialTopMostItemHandler();
const virtuosoScrollHandler = new ReversedScrollHandler();

export const MessagesList: FunctionComponent = observer(() => {
    const {
        messagesOfChat: {
            messagesOfChat
        },
        messageCreation: {
            referredMessageId,
            createMessageForm: {
                text
            },
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
        }
    } = useStore();
    const [reachedBottom, setReachedBottom] = useState(true);
    const theme = useTheme();
    const phantomBottomRef = useRef<HTMLDivElement>(null);
    const messagesListBottomRef = useRef<HTMLDivElement>(null);
    const classes = useStyles();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const virtuosoRef = useRef<VirtuosoMethods>() as RefObject<VirtuosoMethods>
    const messagesDivRef = useRef<HTMLDivElement>(null);

    const calculateStyles = (): MessagesListStyles => {
        let height: string | number;
        let paddingBottom: number = 0;
        let transform: string | undefined = undefined;

        if (enableVirtualScroll && reverseScrollingDirectionOption !== ReverseScrollDirectionOption.DO_NOT_REVERSE) {
            transform = "scaleY(-1)"
        }

        if (onSmallScreen) {
            if (enableVirtualScroll) {
                if (messagesListBottomRef && messagesListBottomRef.current) {
                    const heightToSubtract = theme.spacing(7) + messagesListBottomRef.current.getBoundingClientRect().height;
                    height = window.innerHeight - heightToSubtract;
                } else {
                    height = `calc(100vh - ${referredMessageId ? 238 : 154}px)`;
                }
            } else {
                height = "100%";

                if (messagesListBottomRef && messagesListBottomRef.current) {
                    paddingBottom = messagesListBottomRef.current.getBoundingClientRect().height;
                }
            }
        } else {
            if (messagesListBottomRef && messagesListBottomRef.current) {
                const heightToSubtract = theme.spacing(8) + messagesListBottomRef.current.getBoundingClientRect().height + theme.spacing(2);
                height = window.innerHeight - heightToSubtract;
            } else {
                height = `calc(100vh - ${referredMessageId ? 238 : 154}px)`;
            }
        }

        return {height, paddingBottom, transform};
    }

    const [styles, setStyles] = useState(calculateStyles());

    const scrollToBottom = (): void => {
        if (reachedBottom) {
            setTimeout(
                () => {
                    if (enableVirtualScroll && virtuosoRef && virtuosoRef.current) {
                        if (reverseScrollingDirectionOption === ReverseScrollDirectionOption.DO_NOT_REVERSE) {
                            virtuosoRef.current.scrollToIndex(messagesOfChat.length - 1)
                        } else {
                            virtuosoRef.current.scrollToIndex(0);
                        }
                    } else {
                        if (phantomBottomRef && phantomBottomRef.current) {
                            phantomBottomRef.current.scrollIntoView();
                        }
                    }
                }
            )
        }
    };

    const handleDivScroll = (event: UIEvent<HTMLElement>): void => {
        const coveredDistance = event.currentTarget.scrollHeight - event.currentTarget.scrollTop;
        const reachedBottom = coveredDistance - event.currentTarget.clientHeight <= 1;
        setReachedBottom(reachedBottom);
    };

    const handleWindowScroll = (): void => {
        if (!enableVirtualScroll) {
            const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
            const body = document.body;
            const html = document.documentElement;
            const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            const windowBottom = windowHeight + window.pageYOffset;

            setReachedBottom( documentHeight - windowBottom <= 1);
        }
    }

    useEffect(scrollToBottom, [messagesOfChat, emojiPickerExpanded]);
    useEffect(() => {
        const handleResize = () => {
            setStyles(calculateStyles());
            if (reachedBottom) {
                scrollToBottom();
            }
        }

        document.addEventListener("scroll", handleWindowScroll)
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("scroll", handleWindowScroll);
            window.removeEventListener("resize", handleResize);
        }
    });
    useEffect(() => {
        if (virtuosoRef && virtuosoRef.current && selectedChatId && virtuosoTopMostItemHandler.getInitialTopMostItem(selectedChatId)) {
            // Scroll to the top item to restore scroll position
            virtuosoRef.current.scrollToIndex(virtuosoTopMostItemHandler.getInitialTopMostItem(selectedChatId)!);
        }
    }, [selectedChatId, onSmallScreen])
    useLayoutEffect(
        () => setStyles(calculateStyles()),
        [
            messagesOfChat,
            referredMessageId,
            text,
            onSmallScreen,
            emojiPickerExpanded
        ]
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
                        })
                    }
                }
            }
        },
        [messagesDivRef]
    )

    if (!enableVirtualScroll) {
        return (
            <Fragment>
                <div className={classes.messagesList}
                     onScroll={handleDivScroll}
                     id="messagesList"
                     style={styles}
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
            <div id="messagesList"
                 ref={messagesDivRef}
            >
                <Virtuoso totalCount={messagesOfChat.length}
                          item={index => (
                              <MessagesListItem messageId={messagesOfChat[index]}
                                                onVisibilityChange={visible => {
                                                    if (visible) {
                                                        virtuosoTopMostItemHandler.setInitialTopMostItem(selectedChatId!, index);
                                                    }

                                                    if (reverseScrollingDirectionOption !== ReverseScrollDirectionOption.DO_NOT_REVERSE) {
                                                        if (index === 0) {
                                                            setReachedBottom(visible);
                                                        }
                                                    } else {
                                                        if (index === messagesOfChat.length - 1) {
                                                            setReachedBottom(visible);
                                                        }
                                                    }
                                                }}
                                                inverted={reverseScrollingDirectionOption !== ReverseScrollDirectionOption.DO_NOT_REVERSE}
                                                messagesListHeight={typeof styles.height === "number" ? styles.height : undefined}
                              />
                          )}
                          style={styles}
                          defaultItemHeight={120}
                          overscan={virtualScrollOverscan}
                          ref={virtuosoRef}
                          computeItemKey={index => messagesOfChat[index]}
                />
                <MessagesListBottom ref={messagesListBottomRef}/>
            </div>
        )
    }
});
