import React, {Fragment, FunctionComponent, useEffect, useLayoutEffect, useState} from "react";
import {observer} from "mobx-react";
import {IconButton, useMediaQuery, useTheme} from "@mui/material";
import {InsertEmoticon} from "@mui/icons-material";
import {autoUpdate, offset, useFloating} from "@floating-ui/react";
import {EmojiData} from "emoji-mart";
import {EmojiAndStickerPicker} from "./EmojiAndStickerPicker";
import {EmojiPicker} from "./EmojiPicker";
import {EmojiPickerVariant} from "../types";
import {useRouter, useStore} from "../../store";

interface EmojiPickerContainerProps {
    onEmojiSelected: (emoji: EmojiData) => void,
    iconButtonClassName?: string,
    variant?: EmojiPickerVariant
}

export const EmojiPickerContainer: FunctionComponent<EmojiPickerContainerProps> = observer(({
    onEmojiSelected,
    iconButtonClassName,
    variant = "emoji-and-sticker-picker"
}) => {
    const {
        messageCreation: {
            emojiPickerExpanded,
            setEmojiPickerExpanded,
        },
        emojiPickerTabs: {
            selectedTab
        }
    } = useStore();
    const [open, setOpen] = useState(false);
    const routerStore = useRouter();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
    const [crossAxisOffset, setCrossAxisOffset] = useState(-300);
    const {refs, floatingStyles} = useFloating({
        placement: "top-start",
        strategy: "fixed",
        whileElementsMounted: autoUpdate,
        middleware: [
            offset({
                crossAxis: crossAxisOffset
            })
        ]
    });

    useLayoutEffect(
        () => {
            requestAnimationFrame(() => {
                if (refs.floating?.current && open) {
                    setCrossAxisOffset(-1 * refs.floating.current.getBoundingClientRect().width);
                }
            });
        },
        [refs.floating, selectedTab, open]
    );

    const handleClickOutside = (event: MouseEvent): void => {
        if (refs.floating?.current && !refs.floating.current.contains(event.target as any)
            // Filter click on a button that opens/closes emoji picker button because it's handled separately
            && refs.domReference?.current && !refs.domReference.current.contains(event.target as any)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenEmojiPickerButtonClick = (): void => {
       setOpen(!open);
    };

    const handleExpandEmojiPickerButtonClick = (): void => {
        const queryParameters = emojiPickerExpanded
            ? {}
            : {emojiPickerExpanded: true};
        setEmojiPickerExpanded(!emojiPickerExpanded);

        if (routerStore.currentRoute) {
            routerStore.goTo(
                routerStore.currentRoute,
                routerStore.params,
                queryParameters
            );
        }
    };

    return onSmallScreen
        ? (
            <IconButton className={iconButtonClassName}
                        onClick={handleExpandEmojiPickerButtonClick}
                        size="large"
            >
                <InsertEmoticon/>
            </IconButton>
        )
        : (
            <Fragment>
                <IconButton className={iconButtonClassName}
                            onClick={handleOpenEmojiPickerButtonClick}
                            size="large"
                            ref={refs.setReference}
                >
                    <InsertEmoticon/>
                </IconButton>
                {open && (
                    <div ref={refs.setFloating}
                         style={floatingStyles}
                    >
                        {variant === "emoji-and-sticker-picker"
                            ? (
                                <EmojiAndStickerPicker onEmojiPicked={onEmojiSelected}
                                                       onStickerPicked={() => setOpen(false)}
                                />
                            )
                            : <EmojiPicker onEmojiPicked={onEmojiSelected}/>
                        }
                    </div>
                )}
            </Fragment>
        )
});
