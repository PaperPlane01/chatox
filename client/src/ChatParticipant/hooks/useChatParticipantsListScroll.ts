import {UIEvent} from "react";
import {Theme, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/styles";
import {ChatParticipantsListMode} from "../types";
import {VirtualScrollElement} from "../../Chat/types";
import {useStore} from "../../store";

interface UseChatParticipantsListScroll {
    onLargeScreen: boolean,
    enableVirtualScroll: boolean,
    virtualScrollElement: VirtualScrollElement,
    scrollHandler: (event: UIEvent<HTMLDivElement>) => void
}

export const useChatParticipantsListScroll = (defaultMode: ChatParticipantsListMode): UseChatParticipantsListScroll => {
    const {
        chatsPreferences: {
            enableVirtualScroll,
            virtualScrollElement
        },
        chatParticipantsSearch: {
            isInSearchMode,
            searchChatParticipants,
            paginationState
        },
        chatParticipants: {
            fetchChatParticipants,
            getPaginationState
        },
        chat: {
            selectedChat
        }
    } = useStore();
    const theme = useTheme<Theme>()
    const onLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

    const scrollHandler = (event: UIEvent<HTMLDivElement>): void => {
        const mode: ChatParticipantsListMode = isInSearchMode ? "search" : defaultMode;

        if (mode === "online") {
            // Don't do anything since there is no pagination for online chat participants list
            return;
        }

        const {scrollHeight, scrollTop, clientHeight} = event.currentTarget;
        const reachedBottom = Math.abs(scrollHeight - (scrollTop + clientHeight)) <= 1

        if (mode === "search") {
            if (reachedBottom && !paginationState.pending && !paginationState.noMoreItems) {
                searchChatParticipants();
            }
        } else {
            if (!selectedChat) {
                return;
            }

            const chatId = selectedChat.id;
            const paginationState = getPaginationState(chatId);

            if (reachedBottom && !paginationState.pending && !paginationState.noMoreItems) {
                fetchChatParticipants();
            }
        }
    };

    return {
        enableVirtualScroll,
        virtualScrollElement,
        onLargeScreen,
        scrollHandler
    };
};