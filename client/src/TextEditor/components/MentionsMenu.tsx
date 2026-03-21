import React, {CSSProperties, FunctionComponent, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {CircularProgress, Paper} from "@mui/material";
import {BeautifulMentionsMenuProps} from "lexical-beautiful-mentions";
import {computePosition} from "@floating-ui/dom";
import {offset} from "@floating-ui/react";
import {FloatingElementCoordinates} from "../types";
import {commonStyles} from "../../style";

export const MENTION_MENU_ANCHOR_CLASS_NAME = "lexical-mention-menu-anchor";

export const MentionsMenu: FunctionComponent<BeautifulMentionsMenuProps> = ({loading, children, ...other}) => {
    const [coordinates, setCoordinates] = useState<FloatingElementCoordinates | null>(null);
    const anchorElement = useRef<HTMLElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const selection = getSelection();
        const range = selection?.rangeCount !== 0 && selection?.getRangeAt(0);

        if (!range || !selection) {
            setCoordinates(null);
            return;
        }

        const anchor = document.querySelector(`.${MENTION_MENU_ANCHOR_CLASS_NAME}`) as unknown as HTMLElement;

        if (!anchor) {
            return;
        }

        anchorElement.current = anchor;

        computePosition(
            range,
            anchorElement.current,
            {
                placement: "top",
                middleware: [
                    offset({
                        mainAxis: menuRef.current?.getBoundingClientRect().height
                    })
                ]
            },
        )
            .then(({x, y}) => setCoordinates({x, y}));
    }, [loading, children?.length]);

    return createPortal(
        <Paper style={{
            position: "absolute",
            top: coordinates?.y ?? 0,
            left: coordinates?.x ?? 0,
            visibility: anchorElement.current ? "visible" : "hidden",
            opacity: anchorElement.current ? 1 : 0,
        }}
               ref={menuRef}
               {...other}
        >
            {children}
            {loading && (
                <div style={commonStyles.centered as unknown as CSSProperties}>
                    <CircularProgress size={25} color="primary"/>
                </div>
            )}
        </Paper>,
        document.body
    );
};
