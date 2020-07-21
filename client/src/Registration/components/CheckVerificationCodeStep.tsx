import React, {Fragment, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from "@material-ui/core";
import {CheckEmailVerificationCodeFormData} from "../types";
import {localized, Localized} from "../../localization";
import {FormErrors} from "../../utils/types";
import {ApiError} from "../../api";
import {MapMobxToProps} from "../../store";

interface CheckVerificationCodeStepMobxProps {
    checkVerificationCodeForm: CheckEmailVerificationCodeFormData,
    formErrors: FormErrors<CheckEmailVerificationCodeFormData>,
    pending: boolean,
    error?: ApiError,
    setFormValue: <Key extends keyof CheckEmailVerificationCodeFormData>(key: Key, value: CheckEmailVerificationCodeFormData[Key]) => void,
    checkVerificationCode: () => void
}

type CheckVerificationCodeStepProps = CheckVerificationCodeStepMobxProps & Localized;

const _CheckVerificationCodeStep: FunctionComponent<CheckVerificationCodeStepProps> = ({
    checkVerificationCodeForm,
    formErrors,
    pending,
    error,
    setFormValue,
    checkVerificationCode,
    l
}) => (
    <Fragment>
        <DialogTitle>
            {l("email.verification.code.enter")}
        </DialogTitle>
        <DialogContent>
            <Typography>
                {l("email.verification.code.sent")}
            </Typography>
            <TextField label={l("email.verification.code")}
                       value={checkVerificationCodeForm.verificationCode}
                       fullWidth
                       margin="dense"
                       error={Boolean(formErrors.verificationCode)}
                       helperText={formErrors.verificationCode && l(formErrors.verificationCode)}
                       onChange={event => setFormValue("verificationCode", event.target.value)}
            />
        </DialogContent>
        <DialogActions>
            <Button variant="contained"
                    color="primary"
                    disabled={pending}
                    onClick={() => checkVerificationCode()}
            >
                {pending && <CircularProgress size={25} color="primary"/>}
                {l("registration.continue")}
            </Button>
        </DialogActions>
    </Fragment>
);

const mapMobxToProps: MapMobxToProps<CheckVerificationCodeStepMobxProps> = ({
    verificationCodeCheck
}) => ({
    checkVerificationCodeForm: verificationCodeCheck.checkEmailVerificationCodeForm,
    formErrors: verificationCodeCheck.formErrors,
    pending: verificationCodeCheck.pending,
    error: verificationCodeCheck.error,
    setFormValue: verificationCodeCheck.setFormValue,
    checkVerificationCode: verificationCodeCheck.checkVerificationCode
});

export const CheckVerificationCodeStep = localized(
    inject(mapMobxToProps)(observer(_CheckVerificationCodeStep))
) as FunctionComponent;
