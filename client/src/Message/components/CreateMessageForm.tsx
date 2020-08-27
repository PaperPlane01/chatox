import React, {Fragment, FunctionComponent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import {
    createStyles,
    Divider,
    IconButton,
    InputAdornment,
    makeStyles,
    Menu,
    TextField,
    Theme,
    Tooltip
} from "@material-ui/core";
import {AttachFile, InsertEmoticon, KeyboardVoice, Send} from "@material-ui/icons";
import {bindToggle, bindMenu, usePopupState} from "material-ui-popup-state/hooks";
import {EmojiData, Picker} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import {ReferredMessageCard} from "./ReferredMessageCard";
import {useLocalization, useStore} from "../../store";


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
            referredMessageId,
            setFormValue,
            createMessage,
        },
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const emojiPickerPopupState = usePopupState({variant: "popper", popupId: "emojiPicker"});

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
    }, [referredMessageId])

    const updateText = (): void => {
        setFormValue("text", inputRef!.current!.value);
    }

    const handleEmojiSelect = (emoji: EmojiData): void => {
        if (inputRef && inputRef.current) {
            inputRef.current.value = `${inputRef.current.value}${(emoji as any).native}`;
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
                                   <Tooltip title={l("feature.not-available")}>
                                       <div>
                                           <IconButton disabled
                                                       className={classes.inputIconButton}
                                           >
                                               <AttachFile/>
                                           </IconButton>
                                       </div>
                                   </Tooltip>
                               </InputAdornment>
                           ),
                           endAdornment: (
                               <InputAdornment position="end">
                                   <div style={{display: "flex"}}>
                                       <Fragment>
                                           <IconButton className={classes.inputIconButton}
                                                       {...bindToggle(emojiPickerPopupState)}
                                           >
                                               <InsertEmoticon/>
                                           </IconButton>
                                           <Menu {...bindMenu(emojiPickerPopupState)}>
                                               <Picker set="apple"
                                                       onSelect={handleEmojiSelect}
                                               />
                                           </Menu>
                                       </Fragment>
                                       {formValues.text.length
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
        </div>
    )
});
