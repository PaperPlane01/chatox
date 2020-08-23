import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    createStyles,
    Divider,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
    Theme,
    Tooltip,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import {AttachFile, InsertEmoticon, KeyboardVoice, Send} from "@material-ui/icons";
import {ReferredMessageCard} from "./ReferredMessageCard";
import {useLocalization, useStore} from "../../store";


const useStyles = makeStyles((theme: Theme) => createStyles({
    textField: {
        [theme.breakpoints.down("md")]: {
            backgroundColor: theme.palette.background
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
            setFormValue,
            createMessage
        },
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <div>
            <ReferredMessageCard/>
            <Divider/>
            <TextField fullWidth
                       placeholder={l("message.type-something")}
                       onChange={event => setFormValue("text", event.target.value)}
                       value={formValues.text}
                       multiline
                       rows={onSmallScreen ? 2 : 4}
                       rowsMax={4}
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
                       className={classes.textField}
            />
        </div>
    )
});
