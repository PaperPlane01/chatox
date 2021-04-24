import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    TextField,
    Typography
} from "@material-ui/core";
import {DateTimePicker} from "@material-ui/pickers";
import {GlobalBanReasonSelect} from "./GlobalBanReasonSelect";
import {BanUserFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";
import {useLocalization} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";

interface BanUserGloballyDialogBaseProps {
    formValues: BanUserFormData,
    formErrors: FormErrors<BanUserFormData>,
    open: boolean,
    pending: boolean,
    title: string,
    submitButtonLabel?: string,
    error?: ApiError,
    onClose: () => void,
    onSubmit: () => void,
    setFormValue: <Key extends keyof BanUserFormData>(key: Key, value: BanUserFormData[Key]) => void,
    getErrorLabel: (error: ApiError, l: TranslationFunction) => string
}

export const BanUserGloballyDialogBase: FunctionComponent<BanUserGloballyDialogBaseProps> = observer(({
    formValues,
    formErrors,
    open,
    pending,
    title,
    error,
    onClose,
    onSubmit,
    getErrorLabel,
    setFormValue,
    submitButtonLabel
}) => {
   const {l} = useLocalization();
   const {fullScreen} = useMobileDialog();

   return (
       <Dialog open={open}
               onClose={onClose}
               fullScreen={fullScreen}
               fullWidth
               maxWidth="lg"
       >
           <DialogTitle>
               {title}
           </DialogTitle>
           <DialogContent>
               <DateTimePicker value={formValues.expiresAt || null}
                               label={l("global.ban.expires-at")}
                               onChange={date => setFormValue("expiresAt", date || undefined)}
                               error={Boolean(formErrors.expiresAt)}
                               helperText={formErrors.expiresAt && l(formErrors.expiresAt)}
                               disabled={formValues.permanent}
                               clearable
                               autoOk
                               format="dd MMMM yyyy HH:mm"
                               margin="dense"
                               fullWidth
                               disablePast
                               ampm={false}
               />
               <GlobalBanReasonSelect onSelect={reason => setFormValue("reason", reason)}
                                      value={formValues.reason}
               />
               <TextField label={l("global.ban.comment")}
                          value={formValues.comment}
                          onChange={event => setFormValue("comment", event.target.value)}
                          error={Boolean(formErrors.comment)}
                          helperText={formErrors.comment && l(formErrors.comment)}
                          multiline
                          rows={4}
                          rowsMax={8}
                          fullWidth
                          margin="dense"
               />
               <FormControlLabel control={
                   <Checkbox checked={formValues.permanent}
                             onChange={event => setFormValue("permanent", event.target.checked)}
                   />
               }
                                 label={l("global.ban.permanent")}
               />
               {error && (
                   <Typography style={{color: "red"}}>
                       {getErrorLabel(error, l)}
                   </Typography>
               )}
           </DialogContent>
           <DialogActions>
               <Button variant="outlined"
                       color="secondary"
                       onClick={onClose}
               >
                   {l("close")}
               </Button>
               <Button variant="contained"
                       color="primary"
                       onClick={onSubmit}
                       disabled={pending}
               >
                   {pending && <CircularProgress color="primary" size={15}/>}
                   {submitButtonLabel
                       ? submitButtonLabel
                       : l("global.ban.create")
                   }
               </Button>
           </DialogActions>
       </Dialog>
   );
});
