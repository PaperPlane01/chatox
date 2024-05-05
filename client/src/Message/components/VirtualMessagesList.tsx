import React, {CSSProperties, DependencyList, Fragment, FunctionComponent, RefObject, useRef} from "react";
import {observer} from "mobx-react";
import {useMediaQuery, useTheme} from "@mui/material";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import {MessagesListItem} from "./MessagesListItem";
import {PinnedMessage} from "./PinnedMessage";
import {MessagesListBottom} from "./MessagesListBottom";
import {useMessagesListBottomStyles, useMessagesListRefs, useMessagesListStyles} from "../hooks";
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
        },
        chat: {
            selectedChat
        },
        messagesListScrollPositions: {
            setReachedBottom
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

    const styleDependencies: DependencyList = [
        messagesOfChat,
        referredMessageId,
        onSmallScreen,
        emojiPickerExpanded,
        currentPinnedMessageId,
        currentPinnedMessageIsClosed,
        refs.messagesListRef,
        virtuosoRef
    ];
    const style = useMessagesListStyles(
        calculateStyles,
        refs,
        styleDependencies
    );
    const messagesListBottomStyle = useMessagesListBottomStyles(
        onSmallScreen,
        styleDependencies,
        true
    );

    const fetchNextMessages = (): void => {
        const beforeId = messagesOfChat[0];

        fetchMessages({
            beforeId,
            abortIfInitiallyFetched: false,
            skipSettingLastMessage: true
        });
    };

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
                                                lastMessageReadByAnyoneCreatedAt={selectedChat?.lastMessageReadByAnyoneCreatedAt}
                                                messagesListHeight={typeof style.height === "number"
                                                    ? style.height
                                                    : undefined
                                                }
                              />
                          )}
                          followOutput="auto"
                          ref={virtuosoRef}
                          startReached={fetchNextMessages}
                          atBottomStateChange={atBottom => setReachedBottom(selectedChat!!.id, atBottom)}
                          initialTopMostItemIndex={{
                              index: "LAST"
                          }}
                          useWindowScroll={onSmallScreen}
                          overscan={virtualScrollOverscan}
                          defaultItemHeight={160}
                />
                <MessagesListBottom ref={refs.messagesListBottomRef}
                                    style={messagesListBottomStyle}
                />
            </div>
        </Fragment>
    );
});