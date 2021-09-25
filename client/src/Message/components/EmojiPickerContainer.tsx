import React, {FunctionComponent, Fragment, useLayoutEffect} from "react";
import {observer} from "mobx-react";
import {IconButton, Hidden, Menu, useMediaQuery, useTheme} from "@material-ui/core";
import {InsertEmoticon} from "@material-ui/icons";
import {usePopupState, bindToggle, bindMenu} from "material-ui-popup-state/hooks";
import {EmojiData} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import {EmojiAndStickerPicker} from "./EmojiAndStickerPicker";
import {useStore, useRouter} from "../../store";
import {Routes} from "../../router";

interface EmojiPickerContainerProps {
    onEmojiSelected: (emoji: EmojiData) => void,
    iconButtonClassName: string
}

export const EmojiPickerContainer: FunctionComponent<EmojiPickerContainerProps> = observer(({
    onEmojiSelected,
    iconButtonClassName
}) => {
    const {
        messageCreation: {
            emojiPickerExpanded,
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
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

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

        if (chat) {
            routerStore.router.goTo(
                Routes.chatPage,
                {slug: chat!.slug || chat!.id},
                {},
                queryParameters
            )
        } else if (userId) {
            routerStore.router.goTo(
                Routes.newPrivateChat,
                {},
                {},
                queryParameters
            );
        }
    };

    return (
        <Fragment>
            <Hidden mdDown>
                <IconButton className={iconButtonClassName}
                            {...bindToggle(emojiPickerPopupState)}
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
                >
                    <InsertEmoticon/>
                </IconButton>
            </Hidden>
        </Fragment>
    );
});
