import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, Divider, IconButton, InputAdornment, makeStyles, TextField, Tooltip} from "@material-ui/core";
import {AttachFile, InsertEmoticon, KeyboardVoice, Send} from "@material-ui/icons";
import {CreateMessageFormData} from "../types";
import {localized, Localized} from "../../localization";
import {FormErrors} from "../../utils/types";
import {ApiError} from "../../api";
import {MapMobxToProps} from "../../store";

interface CreateMessageFormMobxProps {
    formValues: CreateMessageFormData,
    formErrors: FormErrors<CreateMessageFormData>,
    pending: boolean,
    submissionError?: ApiError,
    setFormValue: <Key extends keyof CreateMessageFormData>(key: Key, value: CreateMessageFormData[Key]) => void,
    createMessage: () => void
}

const useStyles = makeStyles(() => createStyles({
    createMessageForm: {
        display: "inline-block",
        verticalAlign: "bottom",
        width: "100%"
    }
}));

const _CreateMessageForm: FunctionComponent<CreateMessageFormMobxProps & Localized> = ({
    formErrors,
    formValues,
    pending,
    submissionError,
    createMessage,
    setFormValue,
    l
}) => {
    const classes = useStyles();

    return (
        <div className={classes.createMessageForm}>
            <Divider/>
            <TextField fullWidth
                       placeholder={l("message.type-something")}
                       onChange={event => setFormValue("text", event.target.value)}
                       value={formValues.text}
                       multiline
                       rows={4}
                       InputProps={{
                           startAdornment: (
                               <InputAdornment position="start">
                                   <Tooltip title={l("feature.not-available")}>
                                       <div>
                                           <IconButton disabled>
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
                                               <IconButton disabled>
                                                   <InsertEmoticon/>
                                               </IconButton>
                                           </div>
                                       </Tooltip>
                                       {formValues.text.length
                                           ? (
                                               <IconButton onClick={createMessage}
                                                           color="primary"
                                                           disabled={pending}
                                               >
                                                   <Send/>
                                               </IconButton>
                                           )
                                           : (
                                               <Tooltip title={l("feature.not-available")}>
                                                  <div>
                                                      <IconButton disabled>
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
        </div>
    )
};

const mapMobxToProps: MapMobxToProps<CreateMessageFormMobxProps> = ({messageCreation}) => ({
    formValues: messageCreation.createMessageForm,
    formErrors: messageCreation.formErrors,
    pending: messageCreation.pending,
    submissionError: messageCreation.submissionError,
    createMessage: messageCreation.createMessage,
    setFormValue: messageCreation.setFormValue
});

export const CreateMessageForm = localized(
    inject(mapMobxToProps)(observer(_CreateMessageForm))
) as FunctionComponent;
