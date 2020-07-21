import React, {Fragment, FunctionComponent} from "react";
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
import {RegistrationStep, SendVerificationEmailFormData} from "../types";
import {localized, Localized, TranslationFunction} from "../../localization";
import {FormErrors} from "../../utils/types";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {MapMobxToProps} from "../../store";
import {inject, observer} from "mobx-react";

interface SendVerificationEmailStepMobxProps {
    sendVerificationEmailForm: SendVerificationEmailFormData,
    formErrors: FormErrors<SendVerificationEmailFormData>,
    error?: ApiError,
    pending: boolean,
    checkingEmailAvailability: boolean,
    setFormValue: <Key extends keyof SendVerificationEmailFormData>(key: Key, value: SendVerificationEmailFormData[Key]) => void,
    sendVerificationEmail: () => void,
    setRegistrationStep: (registrationStep: RegistrationStep) => void
}

type SendVerificationEmailStepProps = SendVerificationEmailStepMobxProps & Localized;

const getErrorText = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === 409) {
        return l("email.has-already-been-taken");
    } else if (apiError.status === API_UNREACHABLE_STATUS) {
        return l("registration.send-verification-email.server-unreachable");
    } else {
        return l("registration.send-verification-email.unknown-error", {errorStatus: apiError.status})
    }
};

const _SendVerificationEmailStep: FunctionComponent<SendVerificationEmailStepProps> = ({
    sendVerificationEmailForm,
    formErrors,
    error,
    pending,
    checkingEmailAvailability,
    setFormValue,
    sendVerificationEmail,
    setRegistrationStep,
    l
}) => (
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

const mapMobxToProps: MapMobxToProps<SendVerificationEmailStepMobxProps> = ({
    registrationDialog,
    sendVerificationEmail
}) => ({
    sendVerificationEmailForm: sendVerificationEmail.sendVerificationEmailForm,
    formErrors: sendVerificationEmail.formErrors,
    error: sendVerificationEmail.error,
    pending: sendVerificationEmail.pending,
    checkingEmailAvailability: sendVerificationEmail.checkingEmailAvailability,
    setFormValue: sendVerificationEmail.setFormValue,
    sendVerificationEmail: sendVerificationEmail.sendVerificationEmail,
    setRegistrationStep: registrationDialog.setCurrentStep
});

export const SendVerificationEmailStep = localized(
    inject(mapMobxToProps)(observer(_SendVerificationEmailStep))
) as FunctionComponent;
