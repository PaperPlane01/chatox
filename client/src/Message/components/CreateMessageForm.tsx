import React, {Fragment, FunctionComponent, KeyboardEvent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import {Divider, Hidden, IconButton, InputAdornment, TextField, Theme, Tooltip} from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {KeyboardVoice, Send} from "@mui/icons-material";
import {EmojiData} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import {AttachFilesButton} from "./AttachFilesButton";
import {ReferredMessageCard} from "./ReferredMessageCard";
import {OpenScheduleMessageDialogButton} from "./OpenScheduleMessageDialogButton";
import {EmojiAndStickerPicker} from "./EmojiAndStickerPicker";
import {EmojiPickerContainer} from "./EmojiPickerContainer";
import {useLocalization, useStore} from "../../store";
import {SendMessageButton} from "../../Chat";

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

export const CreateMessageForm: FunctionComponent = observer(() => {
    const {
        messageCreation: {
            createMessageForm: formValues,
            pending,
            emojiPickerExpanded,
            referredMessageId,
            attachmentsIds,
            setFormValue,
            createMessage,
            setEmojiPickerExpanded
        },
        emoji: {
            useEmojiCodes
        },
        chatsPreferences: {
            sendMessageButton
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
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

    const updateText = (): void => {
        setFormValue("text", inputRef!.current!.value);
    };

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
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
        if (event.key !== "Enter") {
            return;
        }

        if (event.ctrlKey) {
            if (sendMessageButton === SendMessageButton.CTRL_ENTER) {
                createMessage();
            } else {
                insertNewLineOnCursorPosition();
            }
        } else if (sendMessageButton === SendMessageButton.ENTER) {
            createMessage();
        } else {
            insertNewLineOnCursorPosition();
        }
    };

    const insertNewLineOnCursorPosition = (): void => {
        if (!inputRef || !inputRef.current) {
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

        updateText();
    };

    return (
        <div>
            <ReferredMessageCard/>
            <Divider/>
            <TextField id="messageTextField"
                       fullWidth
                       placeholder={l("message.type-something")}
                       onChange={updateText}
                       onPaste={updateText}
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
                               </InputAdornment>
                           ),
                           endAdornment: (
                               <InputAdornment position="end"
                                               className={classes.inputAdornment}
                               >
                                   <div style={{display: "flex"}}>
                                       <Fragment>
                                           {formValues.scheduledAt && <OpenScheduleMessageDialogButton/>}
                                           <EmojiPickerContainer onEmojiSelected={handleEmojiSelect}/>
                                       </Fragment>
                                       {formValues.text.length !== 0 || attachmentsIds.length !== 0
                                           ? (
                                               <IconButton
                                                   onClick={createMessage}
                                                   color="primary"
                                                   disabled={pending}
                                                   size="large">
                                                   <Send/>
                                               </IconButton>
                                           )
                                           : (
                                               <Tooltip title={l("feature.not-available")}>
                                                  <div>
                                                      <IconButton disabled size="large">
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
            />
            <Hidden lgUp>
                {emojiPickerExpanded && (
                    <EmojiAndStickerPicker onEmojiPicked={handleEmojiSelect}
                                           onStickerPicked={() => setEmojiPickerExpanded(false)}
                    />
                )}
            </Hidden>
        </div>
    );
});
