import {RefObject} from "react";

export interface MessagesListRefs {
    pinnedMessageRef: RefObject<HTMLDivElement>,
    messagesListBottomRef: RefObject<HTMLDivElement>,
    messagesListRef: RefObject<HTMLDivElement>,
    phantomBottomRef: RefObject<HTMLDivElement>
}