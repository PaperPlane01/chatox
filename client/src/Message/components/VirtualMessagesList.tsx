import React, {CSSProperties, Fragment, FunctionComponent, RefObject, useRef} from "react";
import {observer} from "mobx-react";
import {useMediaQuery, useTheme} from "@mui/material";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import {MessagesListItem} from "./MessagesListItem";
import {PinnedMessage} from "./PinnedMessage";
import {MessagesListBottom} from "./MessagesListBottom";
import {useMessagesListRefs, useMessagesListStyles} from "../hooks";
import {calculateMessagesListStyles} from "../utils";
import {useStore} from "../../store";

export const VirtualMessagesList: FunctionComponent = observer(() => {
    const {
        messagesOfChat: {
            messagesOfChat,
            fetchMessages
        },
        pinnedMessages: {
            currentPinnedMessageId,
            currentPinnedMessageIsClosed
        },
        messageCreation: {
            referredMessageId,
            emojiPickerExpanded
        },
        chatsPreferences: {
            virtualScrollOverscan
        }
    } = useStore();
    const virtuosoRef = useRef<VirtuosoHandle>() as RefObject<VirtuosoHandle>;
    const refs = useMessagesListRefs();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const calculateStyles = (): CSSProperties => calculateMessagesListStyles({
        refs,
        referredMessageId,
        onSmallScreen,
        theme,
        variant: "virtual"
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

    return (
        <Fragment>
            <PinnedMessage ref={refs.pinnedMessageRef}
                           width={(refs.messagesListRef && refs.messagesListRef.current)
                               ? refs.messagesListRef.current.getBoundingClientRect().width
                               : undefined
                           }
            />
            <div id="messagesList"
                 ref={refs.messagesListRef}
                 style={style}
            >
                <Virtuoso totalCount={messagesOfChat.length}
                          data={messagesOfChat}
                          itemContent={(_, messageId) => (
                              <MessagesListItem messageId={messageId}
                                                messagesListHeight={typeof style.height === "number"
                                                    ? style.height
                                                    : undefined
                                                }
                              />
                          )}
                          followOutput="auto"
                          ref={virtuosoRef}
                          startReached={() => fetchMessages()}
                          initialTopMostItemIndex={{
                              index: "LAST"
                          }}
                          useWindowScroll={onSmallScreen}
                          overscan={virtualScrollOverscan}
                          defaultItemHeight={160}
                />
                <MessagesListBottom ref={refs.messagesListBottomRef}/>
            </div>
        </Fragment>
    );
});