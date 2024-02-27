import {CSSProperties, RefObject} from "react";
import {Theme} from "@mui/material";
import {MessagesListRefs} from "../types";
import {isWindowScrollable} from "../../utils/dom-utils";

interface CalculateStylesOptions {
    refs: MessagesListRefs,
    theme: Theme,
    onSmallScreen: boolean,
    referredMessageId?: string,
    variant: "normal" | "virtual"
}

export const calculateMessagesListStyles = (options: CalculateStylesOptions): CSSProperties => {
    const {
        refs: {
            messagesListRef,
            messagesListBottomRef,
            pinnedMessageRef
        },
        onSmallScreen,
        theme,
        referredMessageId,
        variant
    } = options;

    const styles: CSSProperties = {};

    if (onSmallScreen) {
        fillStylesForSmallScreen(
            styles,
            messagesListRef,
            messagesListBottomRef,
            pinnedMessageRef,
            theme,
            referredMessageId,
            variant
        );
    } else {
        fillStylesForLargeScreen(
            styles,
            messagesListBottomRef,
            pinnedMessageRef,
            theme,
            referredMessageId
        );
    }

    return styles;
}

const fillStylesForSmallScreen = (
    style: CSSProperties,
    messagesListRef: RefObject<HTMLDivElement>,
    messagesListBottomRef: RefObject<HTMLDivElement>,
    pinnedMessageRef: RefObject<HTMLDivElement>,
    theme: Theme,
    referredMessageId: string | undefined,
    variant: "normal" | "virtual"
): void => {
    if (variant === "normal") {
        if (messagesListBottomRef?.current && messagesListRef?.current) {
            if (!isWindowScrollable()) {
                style.paddingBottom = messagesListBottomRef.current.getBoundingClientRect().height;
            }
        }

        if (pinnedMessageRef?.current) {
            style.paddingTop = pinnedMessageRef.current.getBoundingClientRect().height;
        }
    } else if (messagesListBottomRef?.current) {
        let heightToSubtract = Number(theme.spacing(7).replace("px", ""))
            + messagesListBottomRef.current.getBoundingClientRect().height;

        if (pinnedMessageRef?.current) {
            heightToSubtract += pinnedMessageRef.current.getBoundingClientRect().height;
        }

        style.height = window.innerHeight - heightToSubtract;
    } else {
        style.height = `calc(100vh - ${referredMessageId ? 238 : 154}px)`;
    }
};

const fillStylesForLargeScreen = (
    style: CSSProperties,
    messagesListBottomRef: RefObject<HTMLDivElement>,
    pinnedMessageRef: RefObject<HTMLDivElement>,
    theme: Theme,
    referredMessageId?: string
): void => {
    if (messagesListBottomRef?.current) {
        let heightToSubtract = Number(theme.spacing(8).replace("px", ""))
            + messagesListBottomRef.current.getBoundingClientRect().height
            + Number(theme.spacing(2).replace("px", ""));

        if (pinnedMessageRef?.current) {
            heightToSubtract = heightToSubtract + pinnedMessageRef.current.getBoundingClientRect().height;
        }

        style.height = window.innerHeight - heightToSubtract;
    } else {
        style.height = `calc(100vh - ${referredMessageId ? 238 : 154}px)`;
    }
};