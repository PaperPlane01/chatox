import React, {Fragment, FunctionComponent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import { Divider, Hidden, IconButton, InputAdornment, TextField, Theme, Tooltip } from "@mui/material";
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {KeyboardVoice, Send} from "@mui/icons-material";
import {EmojiData} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import {AttachFilesButton} from "./AttachFilesButton";
import {ReferredMessageCard} from "./ReferredMessageCard";
import {OpenScheduleMessageDialogButton} from "./OpenScheduleMessageDialogButton";
import {EmojiAndStickerPicker} from "./EmojiAndStickerPicker";
import {useLocalization, useStore} from "../../store";
import {EmojiPickerContainer} from "./EmojiPickerContainer";

const useStyles = makeStyles((theme: Theme) => createStyles({
    textField: {
        [theme.breakpoints.down('lg')]: {
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
            setEmojiPickerExpanded
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
            useEmojiCodes
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
                       minRows={2}
                       maxRows={8}
                       variant="standard"
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
                                           <EmojiPickerContainer onEmojiSelected={handleEmojiSelect}
                                                                 iconButtonClassName={classes.inputIconButton}
                                           />
                                       </Fragment>
                                       {formValues.text.length !== 0 || attachmentsIds.length !== 0
                                           ? (
                                               <IconButton
                                                   onClick={createMessage}
                                                   color="primary"
                                                   disabled={pending}
                                                   className={classes.inputIconButton}
                                                   size="large">
                                                   <Send/>
                                               </IconButton>
                                           )
                                           : (
                                               <Tooltip title={l("feature.not-available")}>
                                                  <div>
                                                      <IconButton disabled className={classes.inputIconButton} size="large">
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
                    <EmojiAndStickerPicker onEmojiPicked={handleEmojiSelect}
                                           onStickerPicked={() => setEmojiPickerExpanded(false)}
                    />
                )}
            </Hidden>
        </div>
    );
});
