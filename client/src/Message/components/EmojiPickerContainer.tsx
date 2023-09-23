import React, {FunctionComponent, Fragment, useLayoutEffect} from "react";
import {observer} from "mobx-react";
import {IconButton, Hidden, Menu, useMediaQuery, useTheme} from "@mui/material";
import {InsertEmoticon} from "@mui/icons-material";
import {usePopupState, bindToggle, bindMenu} from "material-ui-popup-state/hooks";
import {EmojiData} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import {EmojiAndStickerPicker} from "./EmojiAndStickerPicker";
import {useStore, useRouter} from "../../store";
import {Routes} from "../../router";

interface EmojiPickerContainerProps {
    onEmojiSelected: (emoji: EmojiData) => void,
    iconButtonClassName?: string
}

export const EmojiPickerContainer: FunctionComponent<EmojiPickerContainerProps> = observer(({
    onEmojiSelected,
    iconButtonClassName
}) => {
    const {
        messageCreation: {
            emojiPickerExpanded,
            setEmojiPickerExpanded,
            userId
        },
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const routerStore = useRouter();
    const emojiPickerPopupState = usePopupState({
        variant: "popover",
        popupId: "emojiPicker"
    });
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));

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

    const chat = selectedChatId && findChat(selectedChatId);

    const handleExpandEmojiPickerButtonClick = (): void => {
        const queryParameters = emojiPickerExpanded
            ? {}
            : {emojiPickerExpanded: true};
        setEmojiPickerExpanded(!emojiPickerExpanded);

        if (chat) {
            routerStore.goTo(
                Routes.chatPage,
                {slug: chat!.slug || chat!.id},
                queryParameters
            );
        } else if (userId) {
            routerStore.goTo(
                Routes.newPrivateChat,
                {},
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
                    <EmojiAndStickerPicker onEmojiPicked={onEmojiSelected}
                                           onStickerPicked={emojiPickerPopupState.close}
                    />
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
