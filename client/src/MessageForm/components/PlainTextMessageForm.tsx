import React, {Fragment, FunctionComponent, KeyboardEvent, RefObject, useEffect} from "react";
import {observer} from "mobx-react";
import {Hidden, InputAdornment, TextField, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {EmojiData} from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import {AttachFilesButton} from "./AttachFilesButton";
import {SendMessageButton} from "./SendMessageButton";
import {OpenScheduleMessageDialogButton} from "./OpenScheduleMessageDialogButton";
import {RecordVoiceMessageButton} from "./RecordVoiceMessageButton";
import {MessageFormData} from "../types";
import {EmojiAndStickerPicker, EmojiPickerContainer} from "../../EmojiPicker";
import {MarkdownPreviewDialog} from "../../Markdown";
import {useLocalization, useStore} from "../../store";
import {SendMessageButton as SendMessageButtonType} from "../../Chat";
import {ClaimRewardButton} from "../../Reward";
import {Countdown} from "../../Countdown";
import {MessageEntity} from "../../Message";

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
    resultMessage?: MessageEntity,
    clearResultMessage?: () => void,
    setFormValue: <Key extends keyof MessageFormData>(key: Key, value: MessageFormData[Key]) => void,
    submitForm: () => void,
    setEmojiPickerExpanded: (emojiPickerExpended: boolean) => void
}

export const PlainTextMessageForm: FunctionComponent<MessageFormProps> = observer(({
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
    resultMessage,
    clearResultMessage,
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

    useEffect(() => {
        if (resultMessage && clearResultMessage) {
            clearResultMessage();
        }
    }, [resultMessage, clearResultMessage]);

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

        if (useEmojiCodes) {
            insertTextOnCursorPosition(` ${emoji.colons} `);
        } else {
            insertTextOnCursorPosition(`${(emoji as any).native} `);
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

    const insertNewLineOnCursorPosition = (): void => insertTextOnCursorPosition("\r\n");

    const insertTextOnCursorPosition = (text: string): void => {
        if (!inputRef?.current) {
            return;
        }

        let [start, end] = [inputRef.current.selectionStart, inputRef.current.selectionEnd];

        if (start === null || end === null) {
            start = 0;
            end = 1;
        }

        if (end === formValues.text.length) {
            inputRef.current.value = `${inputRef.current.value}${text}`;
        } else {
            inputRef.current.setRangeText(text, start, end, "preserve");
        }

        updateText(inputRef.current.value);
        inputRef.current.focus();
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