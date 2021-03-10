import React, {Fragment, FunctionComponent, useEffect, useLayoutEffect, useRef} from "react";
import {observer} from "mobx-react";
import {
    createStyles,
    Divider,
    Hidden,
    IconButton,
    InputAdornment,
    makeStyles,
    Menu,
    TextField,
    Theme,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import {InsertEmoticon, KeyboardVoice, Send} from "@material-ui/icons";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {EmojiData, Picker} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import {AttachFilesButton} from "./AttachFilesButton";
import {ReferredMessageCard} from "./ReferredMessageCard";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {OpenScheduleMessageDialogButton} from "./OpenScheduleMessageDialogButton";

const useStyles = makeStyles((theme: Theme) => createStyles({
    textField: {
        [theme.breakpoints.down("md")]: {
            backgroundColor: theme.palette.background
        }
    },
    inputIconButton: {
        [theme.breakpoints.up("lg")]: {
            marginTop: theme.spacing(2)
        }
    }
}));

export const CreateMessageForm: FunctionComponent = observer(() => {
    const {
        messageCreation: {
            createMessageForm: formValues,
            formErrors,
            pending,
            submissionError,
            emojiPickerExpanded,
            referredMessageId,
            attachmentsIds,
            setFormValue,
            createMessage,
        },
        entities: {
            chats: {
                findById: findChat
            }
        },
        chat: {
            selectedChatId
        },
        emoji: {
            selectedEmojiSet,
            useEmojiCodes
        }
    } = useStore();
    const {l} = useLocalization();
    const routerStore = useRouter();
    const classes = useStyles();
    const emojiPickerPopupState = usePopupState({
        variant: "popover",
        popupId: "emojiPicker"
    });
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (formValues.text === "") {
            if (inputRef && inputRef.current) {
                inputRef.current.value = "";
            }
        }
    });

    useEffect(() => {
        if (referredMessageId && inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [referredMessageId]);

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

    const chat = findChat(selectedChatId!);

    const updateText = (): void => {
        setFormValue("text", inputRef!.current!.value);
    }

    const handleEmojiSelect = (emoji: EmojiData): void => {
        if (inputRef && inputRef.current) {
            if (!useEmojiCodes) {
                inputRef.current.value = `${inputRef.current.value}${(emoji as any).native}`;
            } else {
                if (inputRef.current.value.length !== 0) {
                    inputRef.current.value = `${inputRef.current.value} ${emoji.colons}`;
                } else {
                    inputRef.current.value = `${emoji.colons}`;
                }
            }
            updateText();
        }
    }

    return (
        <div>
            <ReferredMessageCard/>
            <Divider/>
            <TextField id="messageTextField"
                       fullWidth
                       placeholder={l("message.type-something")}
                       onChange={updateText}
                       onPaste={updateText}
                       inputRef={inputRef}
                       multiline
                       rows={2}
                       rowsMax={8}
                       InputProps={{
                           disableUnderline: true,
                           startAdornment: (
                               <InputAdornment position="start">
                                   <AttachFilesButton className={classes.inputIconButton}/>
                               </InputAdornment>
                           ),
                           endAdornment: (
                               <InputAdornment position="end">
                                   <div style={{display: "flex"}}>
                                       <Fragment>
                                           {formValues.scheduledAt && (<OpenScheduleMessageDialogButton className={classes.inputIconButton}/>)}
                                           <Hidden mdDown>
                                               <IconButton className={classes.inputIconButton}
                                                           {...bindToggle(emojiPickerPopupState)}
                                               >
                                                   <InsertEmoticon/>
                                               </IconButton>
                                               <Menu {...bindMenu(emojiPickerPopupState)}>
                                                   <Picker set={selectedEmojiSet === "native" ? undefined : selectedEmojiSet}
                                                           onSelect={handleEmojiSelect}
                                                           autoFocus={false}
                                                           native={selectedEmojiSet === "native"}
                                                   />
                                               </Menu>
                                           </Hidden>
                                           <Hidden lgUp>
                                               <IconButton className={classes.inputIconButton}
                                                           onClick={() => {
                                                               routerStore.router.goTo(
                                                                   Routes.chatPage,
                                                                   {slug: chat!.slug || chat!.id},
                                                                   {},
                                                                   emojiPickerExpanded
                                                                       ? {}
                                                                       : {emojiPickerExpanded: true}
                                                               )
                                                           }}
                                               >
                                                   <InsertEmoticon/>
                                               </IconButton>
                                           </Hidden>
                                       </Fragment>
                                       {formValues.text.length !== 0 || attachmentsIds.length !== 0
                                           ? (
                                               <IconButton onClick={createMessage}
                                                           color="primary"
                                                           disabled={pending}
                                                           className={classes.inputIconButton}
                                               >
                                                   <Send/>
                                               </IconButton>
                                           )
                                           : (
                                               <Tooltip title={l("feature.not-available")}>
                                                  <div>
                                                      <IconButton disabled
                                                                  className={classes.inputIconButton}
                                                      >
                                                          <KeyboardVoice/>
                                                      </IconButton>
                                                  </div>
                                               </Tooltip>
                                           )
                                       }
                                   </div>
                               </InputAdornment>
                           )
                       }}
                       className={classes.textField}
            />
            <Hidden lgUp>
                {emojiPickerExpanded && (
                    <Picker set={selectedEmojiSet === "native" ? undefined : selectedEmojiSet}
                            onSelect={handleEmojiSelect}
                            autoFocus={false}
                            showPreview={false}
                            showSkinTones={false}
                            native={selectedEmojiSet === "native"}
                            style={{
                                width: "100%",
                                backgroundColor: theme.palette.background.default
                            }}
                    />
                )}
            </Hidden>
        </div>
    )
});
