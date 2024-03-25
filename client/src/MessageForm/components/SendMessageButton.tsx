import React, {Fragment, FunctionComponent, useCallback, useState} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu} from "@mui/material";
import {Send} from "@mui/icons-material";
import {LongPressCallbackReason, useLongPress} from "use-long-press";
import {SendMessageMenuItem} from "./SendMessageMenuItem";
import {ShowPreviewMenuItem} from "../../Message";

interface SendMessageButtonProps {
    onClick: () => void,
    onOpenPreviewClick?: () => void,
    disabled?: boolean
}

export const SendMessageButton: FunctionComponent<SendMessageButtonProps> = observer(({
    onClick,
    onOpenPreviewClick,
    disabled = false
}) => {
    const [longPressed, setLongPressed] = useState(false);
    const [anchorElement, setAnchorElement] = useState<Element | null>(null);
    const handleLongPress = useCallback(() => setLongPressed(true), []);
    const createLongPressHandlers = useLongPress(handleLongPress, {
        onStart: event => setAnchorElement(event.currentTarget),
        onCancel: (_, meta) => {
            setLongPressed(false);
            setAnchorElement(null);

            if (meta.reason === LongPressCallbackReason.CancelledByRelease) {
                onClick();
            }
        }
    });
    const longPressHandlers = createLongPressHandlers("sendMessage");

    const handleSendClick = (): void => {
        setLongPressed(false);
        onClick();
    };

    const handlePreviewClick = (): void => {
        if (!onOpenPreviewClick) {
            return;
        }

        setLongPressed(false);
        onOpenPreviewClick();
    };

    return (
        <Fragment>
            <IconButton disabled={disabled}
                        color="primary"
                        size="large"
                        {...longPressHandlers}
            >
                <Send/>
            </IconButton>
            <Menu open={Boolean(longPressed && anchorElement)}
                  anchorEl={anchorElement}
                  onClose={() => {
                      setLongPressed(false);
                      setAnchorElement(null);
                  }}
            >
                <SendMessageMenuItem onClick={handleSendClick}/>
                <ShowPreviewMenuItem onClick={handlePreviewClick}/>
            </Menu>
        </Fragment>
    );
});
