import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from "@material-ui/core";
import {TranslationFunction} from "../../localization";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {useLocalization, useStore} from "../../store";

const getErrorText = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === 410) {
        return l("email.verification.code.expired");
    } else if (apiError.status === API_UNREACHABLE_STATUS) {
        return l("email.verification.server-unreachable");
    } else return l("email.verification.unknown-error", {errorStatus: apiError.status});
};

export const CheckVerificationCodeStep: FunctionComponent = observer(() => {
    const {
        verificationCodeCheck: {
            checkEmailVerificationCodeForm,
            formErrors,
            pending,
            error,
            setFormValue,
            checkVerificationCode
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <DialogTitle>
                {l("email.verification.code.enter")}
            </DialogTitle>
            <DialogContent>
                <Typography>
                    {l("email.verification.code.sent")}
                </Typography>
                <TextField label={l("email.verification.code")}
                           value={checkEmailVerificationCodeForm.verificationCode}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.verificationCode)}
                           helperText={formErrors.verificationCode && l(formErrors.verificationCode)}
                           onChange={event => setFormValue("verificationCode", event.target.value)}
                />
                {error && (
                    <Typography style={{color: "red"}}>
                        {getErrorText(error, l)}
                    </Typography>
                )}
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
});
