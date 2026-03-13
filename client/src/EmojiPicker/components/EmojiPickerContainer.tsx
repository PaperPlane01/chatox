import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Box, IconButton, Menu} from "@mui/material";
import {InsertEmoticon} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
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
        }
    } = useStore();
    const routerStore = useRouter();
    const emojiPickerPopupState = usePopupState({
        variant: "popover",
        popupId: "emojiPicker"
    });

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

    return (
        <Fragment>
            <Box sx={{
                display: {
                    xs: "none",
                    lg: "block"
                }
            }}>
                <IconButton
                    className={iconButtonClassName}
                    {...bindToggle(emojiPickerPopupState)}
                    size="large"
                >
                    <InsertEmoticon/>
                </IconButton>
                <Menu {...bindMenu(emojiPickerPopupState)}>
                    {variant === "emoji-and-sticker-picker"
                        ? (
                            <EmojiAndStickerPicker onEmojiPicked={onEmojiSelected}
                                                   onStickerPicked={emojiPickerPopupState.close}
                            />
                        )
                        : <EmojiPicker onEmojiPicked={onEmojiSelected}/>
                    }
                </Menu>
            </Box>
            <Box sx={{
                display: {
                    lg: "none",
                    xs: "block"
                }
            }}>
                <IconButton className={iconButtonClassName}
                            onClick={handleExpandEmojiPickerButtonClick}
                            size="large"
                >
                    <InsertEmoticon/>
                </IconButton>
            </Box>
        </Fragment>
    );
});
