import React, {Fragment, FunctionComponent, UIEvent, useEffect, useLayoutEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {createStyles, Hidden, makeStyles, Theme, useMediaQuery, useTheme} from "@material-ui/core";
import {Virtuoso} from "react-virtuoso";
import {MessagesListItem} from "./MessagesListItem";
import {MessagesListBottom} from "./MessagesListBottom";
import {useStore} from "../../store";

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
    paddingBottom: number
}

interface VirtuosoInitialTopMostIndexMap {
    [chatId: string]: {
        index: number,
        previous: number[]
    }
}

// Map for keeping scroll position after switching chats
const virtuosoInitialTopMostIndexMap: VirtuosoInitialTopMostIndexMap = {};

interface VirtuosoLastVisibleIndexMap {
    [chatId: string]: number
}

// Map for keeping last visible item of list
// This is used on mobile devices
const virtuosoLastVisibleIndexMap: VirtuosoLastVisibleIndexMap = {};

const setInitialTopMostItem = (index: number, chatId: string) => {
    if (!virtuosoInitialTopMostIndexMap[chatId]) {
        virtuosoInitialTopMostIndexMap[chatId] = {
            index: 0,
            previous: []
        }
    }

    if (virtuosoInitialTopMostIndexMap[chatId].previous && virtuosoInitialTopMostIndexMap[chatId].previous.length !== 0) {
        const previous = virtuosoInitialTopMostIndexMap[chatId].previous[virtuosoInitialTopMostIndexMap[chatId].previous.length - 1];

        // For some reason react-virtuoso shifts startIndex position by 1 even if it's not been visible (even if overscan is not used)
        // This causes scroll position to shift by 1 upwards for no reason
        if ((previous - index) === 1) {
            // Negate this effect
            index = previous;
        } else if ((previous - index) > 20) {
            // Looks like some kind of race condition happens when switching between chats.
            // For some reason position of current chat is set to previous chat on first render.
            // We detect too large difference between current position and previous position of chat to avoid
            // scrolling to incorrect position when switching back.
            // This is a hacky work-around but I can't see any other way currently :(
            index = previous;
        }
    }

    // Save scroll position for selected chat
    virtuosoInitialTopMostIndexMap[chatId].index = index;

    if (virtuosoInitialTopMostIndexMap[chatId].previous) {
        virtuosoInitialTopMostIndexMap[chatId].previous.push(index);

        if (virtuosoInitialTopMostIndexMap[chatId].previous.length > 30) {
            // Do cleanup if we have too many items in scroll history array
            virtuosoInitialTopMostIndexMap[chatId].previous = virtuosoInitialTopMostIndexMap[chatId].previous.slice(25)
        }
    } else {
        virtuosoInitialTopMostIndexMap[chatId].previous = [index];
    }
}

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
            useVirtualScroll
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
    const virtuosoRef = useRef<any>();

    const calculateStyles = (): MessagesListStyles => {
        let height: string | number;
        let paddingBottom: number = 0;

        if (onSmallScreen) {
            if (useVirtualScroll) {
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

        return {height, paddingBottom};
    }

    const [styles, setStyles] = useState(calculateStyles());

    const scrollToBottom = (): void => {
        if (reachedBottom && phantomBottomRef && phantomBottomRef.current) {
            setTimeout(() => phantomBottomRef!.current!.scrollIntoView());
        }
    };

    const handleDivScroll = (event: UIEvent<HTMLElement>): void => {
        const coveredDistance = event.currentTarget.scrollHeight - event.currentTarget.scrollTop;
        const reachedBottom = coveredDistance - event.currentTarget.clientHeight <= 1;
        setReachedBottom(reachedBottom);
    };

    const handleWindowScroll = (): void => {
        if (!useVirtualScroll) {
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
        // Check if we have saved top item index for this chat
        if (!onSmallScreen) {
            // Look for initial top most item if we are not on small screen
            if (virtuosoRef && virtuosoRef.current && selectedChatId && virtuosoInitialTopMostIndexMap[selectedChatId]) {
                // Scroll to the top item to restore scroll position
                virtuosoRef.current.scrollToIndex(virtuosoInitialTopMostIndexMap[selectedChatId].index);
            }
        } else {
            // Look for last visible index if we are on small screen
            if (virtuosoRef && virtuosoRef.current && selectedChatId && virtuosoLastVisibleIndexMap[selectedChatId]) {
                virtuosoRef.current.scrollToIndex(virtuosoLastVisibleIndexMap[selectedChatId]);
            }
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

    if (!useVirtualScroll) {
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
            <div id="messagesList">
                <Hidden mdDown>
                    <Virtuoso totalCount={messagesOfChat.length}
                              item={index => {
                                  return (
                                      <MessagesListItem messageId={messagesOfChat[index]}
                                                        key={messagesOfChat[index]}
                                                        onVisibilityChange={visible => {
                                                            if (index === messagesOfChat.length - 1) {
                                                                setReachedBottom(visible);
                                                            }
                                                        }}
                                      />
                                  )
                              }}
                              style={styles}
                              defaultItemHeight={128}
                              followOutput
                              footer={() => <div id="phantomBottom" ref={phantomBottomRef}/>}
                              rangeChanged={({startIndex}) => {
                                  if (startIndex > 5) {
                                      setInitialTopMostItem(startIndex, selectedChatId!);
                                  }
                              }}
                              ref={virtuosoRef}
                    />
                </Hidden>
                <Hidden lgUp>
                    <Virtuoso totalCount={messagesOfChat.length}
                              item={index => (
                                  <MessagesListItem messageId={messagesOfChat[index]}
                                                    key={messagesOfChat[index]}
                                                    onVisibilityChange={visible => {
                                                        if (visible) {
                                                            if (virtuosoLastVisibleIndexMap[selectedChatId!]) {
                                                                if (Math.abs(index - virtuosoLastVisibleIndexMap[selectedChatId!]) > 3) {
                                                                    virtuosoLastVisibleIndexMap[selectedChatId!] = index;
                                                                }
                                                            } else {
                                                                virtuosoLastVisibleIndexMap[selectedChatId!] = index;
                                                            }
                                                        }

                                                        if (index === messagesOfChat.length - 1) {
                                                            setReachedBottom(visible);
                                                        }
                                                    }}
                                  />
                              )}
                              style={styles}
                              defaultItemHeight={120}
                              overscan={2400}
                              footer={() => <div id="phantomBottom" ref={phantomBottomRef}/>}
                              followOutput
                              ref={virtuosoRef}
                    />
                </Hidden>
                <MessagesListBottom ref={messagesListBottomRef}/>
            </div>
        )
    }
});
