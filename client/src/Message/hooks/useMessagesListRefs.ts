import {useRef} from "react";
import {MessagesListRefs} from "../types";

export const useMessagesListRefs = (): MessagesListRefs => {
    const pinnedMessageRef = useRef<HTMLDivElement>(null);
    const messagesListBottomRef = useRef<HTMLDivElement>(null);
    const messagesListRef = useRef<HTMLDivElement>(null);
    const phantomBottomRef = useRef<HTMLDivElement>(null);

    return {
        phantomBottomRef,
        messagesListBottomRef,
        messagesListRef,
        pinnedMessageRef
    };
}