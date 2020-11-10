import React, {Fragment, FunctionComponent} from "react"
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    Typography
} from "@material-ui/core";
import {RegistrationStep} from "../types";
import {TranslationFunction} from "../../localization";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {useLocalization, useStore} from "../../store";

const getErrorText = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === 409) {
        return l("email.has-already-been-taken");
    } else if (apiError.status === API_UNREACHABLE_STATUS) {
        return l("registration.send-verification-email.server-unreachable");
    } else {
        return l("registration.send-verification-email.unknown-error", {errorStatus: apiError.status})
    }
};

export const SendVerificationEmailStep: FunctionComponent = observer(() => {
    const {
        sendVerificationEmail: {
            sendVerificationEmailForm,
            formErrors,
            error,
            pending,
            checkingEmailAvailability,
            setFormValue,
            sendVerificationEmail
        },
        registrationDialog: {
            setCurrentStep: setRegistrationStep
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <DialogTitle>
                {l("registration.provide-your-email")}
            </DialogTitle>
            <DialogContent>
                <TextField label={l("email")}
                           value={sendVerificationEmailForm.email}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.email)}
                           helperText={formErrors.email && l(formErrors.email)}
                           onChange={event => setFormValue("email", event.target.value)}
                           InputProps={{
                               endAdornment: checkingEmailAvailability && (
                                   <InputAdornment position="end">
                                       <CircularProgress size={15} color="primary"/>
                                   </InputAdornment>
                               )
                           }}
                />
                {error && (
                    <Typography style={{color: "red"}}>
                        {getErrorText(error, l)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        onClick={() => setRegistrationStep(RegistrationStep.CONFIRM_SKIPPING_EMAIL)}
                >
                    {l("registration.skip-email")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={() => sendVerificationEmail()}
                        disabled={pending || checkingEmailAvailability}
                >
                    {pending && <CircularProgress size={20}/>}
                    {l("registration.send-verification-email")}
                </Button>
            </DialogActions>
        </Fragment>
    );
});
