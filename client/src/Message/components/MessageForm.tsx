import React, {Fragment, FunctionComponent, KeyboardEvent, RefObject, useEffect} from "react";
import {observer} from "mobx-react";
import {Hidden, InputAdornment, TextField, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {EmojiData} from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import {AttachFilesButton} from "./AttachFilesButton";
import {OpenScheduleMessageDialogButton} from "./OpenScheduleMessageDialogButton";
import {EmojiAndStickerPicker} from "./EmojiAndStickerPicker";
import {EmojiPickerContainer} from "./EmojiPickerContainer";
import {SendMessageButton} from "./SendMessageButton";
import {RecordVoiceMessageButton} from "./RecordVoiceMessageButton";
import {MessageFormData} from "../types";
import {MarkdownPreviewDialog} from "../../Markdown";
import {useLocalization, useStore} from "../../store";
import {SendMessageButton as SendMessageButtonType} from "../../Chat";
import {ClaimRewardButton} from "../../Reward";
import {Countdown} from "../../Countdown";

const useStyles = makeStyles((theme: Theme) => createStyles({
    textField: {
        [theme.breakpoints.down("lg")]: {
            backgroundColor: theme.palette.background
        }
    },
    inputAdornment: {
        [theme.breakpoints.up("lg")]: {
            paddingTop: theme.spacing(2)
        }
    }
}));

interface MessageFormProps {
    formValues: MessageFormData,
    pending: boolean,
    emojiPickerExpanded: boolean,
    attachmentsIds: string[],
    allowScheduled?: boolean,
    inputRef: RefObject<HTMLInputElement>,
    scheduledAt?: Date,
    nextMessageDate?: Date,
    forwardedMessagesCount?: number,
    showVoiceMessageButton?: boolean,
    setFormValue: <Key extends keyof MessageFormData>(key: Key, value: MessageFormData[Key]) => void,
    submitForm: () => void,
    setEmojiPickerExpanded: (emojiPickerExpended: boolean) => void
}

export const MessageForm: FunctionComponent<MessageFormProps> = observer(({
    formValues,
    pending,
    emojiPickerExpanded,
    allowScheduled = false,
    inputRef,
    attachmentsIds,
    scheduledAt,
    nextMessageDate,
    forwardedMessagesCount = 0,
    showVoiceMessageButton = false,
    setFormValue,
    setEmojiPickerExpanded,
    submitForm
}) => {
    const {
        emoji: {
            useEmojiCodes
        },
        chatsPreferences: {
            sendMessageButton
        },
        markdownPreviewDialog: {
            setMarkdownPreviewDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    useEffect(() => {
        if (inputRef?.current) {
            inputRef.current.value = formValues.text;
        }
    });

    const showSendMessageButton = !showVoiceMessageButton
        || formValues.text.length !== 0
        || attachmentsIds.length !== 0
        || forwardedMessagesCount > 0;

    const updateText = (text: string): void => {
        setFormValue("text", text);
    };

    const handleEmojiSelect = (emoji: EmojiData): void => {
        if (!inputRef?.current) {
            return;
        }

        if (!useEmojiCodes) {
            inputRef.current.value = `${inputRef.current.value}${(emoji as any).native}`;
        } else if (inputRef.current.value.length !== 0) {
            inputRef.current.value = `${inputRef.current.value} ${emoji.colons}`;
        } else {
            inputRef.current.value = `${emoji.colons}`;
        }

        updateText(inputRef.current.value);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
        if (event.key !== "Enter") {
            return;
        }

        if (event.ctrlKey) {
            if (sendMessageButton === SendMessageButtonType.CTRL_ENTER) {
                submitForm();
            } else {
                insertNewLineOnCursorPosition();
            }
        } else if (sendMessageButton === SendMessageButtonType.ENTER) {
            event.preventDefault();
            submitForm();
        }
    };

    const insertNewLineOnCursorPosition = (): void => {
        if (!inputRef?.current) {
            return;
        }

        let [start, end] = [inputRef.current.selectionStart, inputRef.current.selectionEnd];

        if (start === null || end === null) {
            start = 0;
            end = 1;
        }

        if (end === formValues.text.length) {
            inputRef.current.value = `${inputRef.current.value}\r\n`;
        } else {
            inputRef.current.setRangeText("\r\n", start, end, "preserve");
        }

        updateText(inputRef.current.value);
    };

    return (
        <Fragment>
            <TextField id="messageTextField"
                       fullWidth
                       placeholder={l("message.type-something")}
                       onChange={() => updateText(inputRef?.current?.value ?? "")}
                       onPaste={() => updateText(inputRef?.current?.value ?? "")}
                       onKeyDown={handleKeyDown}
                       inputRef={inputRef}
                       multiline
                       maxRows={8}
                       variant="standard"
                       className={classes.textField}
                       InputProps={{
                           disableUnderline: true,
                           startAdornment: (
                               <InputAdornment position="start"
                                               className={classes.inputAdornment}
                               >
                                   <AttachFilesButton/>
                                   <ClaimRewardButton/>
                               </InputAdornment>
                           ),
                           endAdornment: (
                               <InputAdornment position="end"
                                               className={classes.inputAdornment}
                               >
                                   <div style={{display: "flex", alignItems: "center"}}>
                                       {allowScheduled && scheduledAt && <OpenScheduleMessageDialogButton/>}
                                       <EmojiPickerContainer onEmojiSelected={handleEmojiSelect}/>
                                       <Countdown date={nextMessageDate}>
                                           {showSendMessageButton
                                               ? (
                                                   <SendMessageButton onClick={submitForm}
                                                                      onOpenPreviewClick={() => setMarkdownPreviewDialogOpen(true)}
                                                                      disabled={pending}
                                                   />
                                               )
                                               : <RecordVoiceMessageButton/>
                                           }
                                       </Countdown>
                                   </div>
                               </InputAdornment>
                           )
                       }}
            />
            <Hidden lgUp>
                {emojiPickerExpanded && (
                    <EmojiAndStickerPicker onEmojiPicked={handleEmojiSelect}
                                           onStickerPicked={() => {
                                               if (emojiPickerExpanded) {
                                                   setEmojiPickerExpanded(false);
                                                   window.history.go(-1);
                                               }
                                           }}
                    />
                )}
            </Hidden>
            <MarkdownPreviewDialog text={formValues.text}/>
        </Fragment>
    );
});
