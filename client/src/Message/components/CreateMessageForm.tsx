import React, {FunctionComponent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import {
    createStyles,
    Divider,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
    Theme,
    Tooltip
} from "@material-ui/core";
import {AttachFile, InsertEmoticon, KeyboardVoice, Send} from "@material-ui/icons";
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
                       rows={1}
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
                                       <Tooltip title={l("feature.not-available")}>
                                           <div>
                                               <IconButton disabled
                                                           className={classes.inputIconButton}
                                               >
                                                   <InsertEmoticon/>
                                               </IconButton>
                                           </div>
                                       </Tooltip>
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
