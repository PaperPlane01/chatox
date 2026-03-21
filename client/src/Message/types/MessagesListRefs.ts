import {RefObject} from "react";

export interface MessagesListRefs {
    pinnedMessageRef: RefObject<HTMLDivElement | null>,
    messagesListBottomRef: RefObject<HTMLDivElement | null>,
    messagesListRef: RefObject<HTMLDivElement | null>,
    phantomBottomRef: RefObject<HTMLDivElement | null>
}