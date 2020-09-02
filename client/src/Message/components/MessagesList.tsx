import React, {
    Fragment,
    FunctionComponent,
    UIEvent,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles, Theme, useMediaQuery, useTheme} from "@material-ui/core";
import VisibilitySensor from "react-visibility-sensor";
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
        }
    } = useStore();
    const [reachedBottom, setReachedBottom] = useState(true);
    const theme = useTheme();
    const phantomBottomRef = useRef<HTMLDivElement>(null);
    const messagesListBottomRef = useRef<HTMLDivElement>(null);
    const classes = useStyles();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

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
        const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const documentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        const windowBottom = windowHeight + window.pageYOffset;

        setReachedBottom( documentHeight - windowBottom <= 1);
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
    })
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
        return <div id="messagesList">
            <Virtuoso totalCount={messagesOfChat.length}
                      item={index => {
                          if (index === messagesOfChat.length - 1) {
                              return (
                                  <VisibilitySensor onChange={isVisible => setReachedBottom(isVisible)}>
                                      <MessagesListItem messageId={messagesOfChat[index]} key={messagesOfChat[index]}/>
                                  </VisibilitySensor>
                              )
                          } else {
                              return <MessagesListItem messageId={messagesOfChat[index]} key={messagesOfChat[index]}/>
                          }
                      }}
                      style={styles}
                      defaultItemHeight={120}
                      overscan={2400}
                      footer={() => <div id="phantomBottom" ref={phantomBottomRef}/>}
                      followOutput
            />
            <MessagesListBottom ref={messagesListBottomRef}/>
        </div>
    }
});
