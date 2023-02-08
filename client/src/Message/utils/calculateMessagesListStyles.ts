import {MessagesListRefs} from "../types";
import {Theme} from "@mui/material";
import {CSSProperties, RefObject} from "react";

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
    messagesListBottomRef: RefObject<HTMLDivElement>,
    pinnedMessageRef: RefObject<HTMLDivElement>,
    theme: Theme,
    referredMessageId: string | undefined,
    variant: "normal" | "virtual"
): void => {
    if (variant === "normal") {
        style.height = "100%";

        if (messagesListBottomRef && messagesListBottomRef.current) {
            style.paddingBottom = messagesListBottomRef.current.getBoundingClientRect().height;
        }

        if (pinnedMessageRef && pinnedMessageRef.current) {
            style.paddingTop = pinnedMessageRef.current.getBoundingClientRect().height;
        }
    } else {
        if (messagesListBottomRef && messagesListBottomRef.current) {
            let heightToSubtract = Number(theme.spacing(7).replace("px", ""))
                + messagesListBottomRef.current.getBoundingClientRect().height;

            if (pinnedMessageRef && pinnedMessageRef.current) {
                heightToSubtract += pinnedMessageRef.current.getBoundingClientRect().height;
            }

            style.height = window.innerHeight - heightToSubtract;
        } else {
            style.height = `calc(100vh - ${referredMessageId ? 238 : 154}px)`;
        }
    }
};

const fillStylesForLargeScreen = (
    style: CSSProperties,
    messagesListBottomRef: RefObject<HTMLDivElement>,
    pinnedMessageRef: RefObject<HTMLDivElement>,
    theme: Theme,
    referredMessageId?: string
): void => {
    if (messagesListBottomRef && messagesListBottomRef.current) {
        let heightToSubtract = Number(theme.spacing(8).replace("px", ""))
            + messagesListBottomRef.current.getBoundingClientRect().height
            + Number(theme.spacing(2).replace("px", ""));

        if (pinnedMessageRef && pinnedMessageRef.current) {
            heightToSubtract = heightToSubtract + pinnedMessageRef.current.getBoundingClientRect().height;
        }

        style.height = window.innerHeight - heightToSubtract;
    } else {
        style.height = `calc(100vh - ${referredMessageId ? 238 : 154}px)`;
    }
};