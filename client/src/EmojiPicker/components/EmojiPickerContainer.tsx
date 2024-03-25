import React, {Fragment, FunctionComponent, useLayoutEffect} from "react";
import {observer} from "mobx-react";
import {Hidden, IconButton, Menu, useMediaQuery, useTheme} from "@mui/material";
import {InsertEmoticon} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {EmojiData} from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
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
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    useLayoutEffect(() => {
            if (!onSmallScreen) {
                setTimeout(() => {
                    // For some reason search text field in emoji-mart picker is being focused right after render
                    // despite passing autoFocus={false} property, so I have to do this ugly work-around
                    const emojiMartTextFieldWrappers = document.getElementsByClassName("emoji-mart-search");

                    if (emojiMartTextFieldWrappers && emojiMartTextFieldWrappers.length !== 0) {
                        const emojiMartTextFieldWrapper = emojiMartTextFieldWrappers.item(0);

                        if (emojiMartTextFieldWrapper && emojiMartTextFieldWrapper.children && emojiMartTextFieldWrapper.children.length !== 0) {
                            const emojiMartSearchTextField = emojiMartTextFieldWrapper.children.item(0) as HTMLInputElement;

                            if (emojiMartSearchTextField) {
                                emojiMartSearchTextField.blur();
                            }
                        }
                    }
                });
            }},
        [emojiPickerPopupState.isOpen]
    );

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
            <Hidden lgDown>
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
            </Hidden>
            <Hidden lgUp>
                <IconButton className={iconButtonClassName}
                            onClick={handleExpandEmojiPickerButtonClick}
                            size="large"
                >
                    <InsertEmoticon/>
                </IconButton>
            </Hidden>
        </Fragment>
    );
});
