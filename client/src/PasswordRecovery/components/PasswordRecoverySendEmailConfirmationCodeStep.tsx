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
} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === 404) {
        return l("password-recovery.error.account-not-found");
    } else if (error.status === API_UNREACHABLE_STATUS) {
        return l("error.generic.server-unreachable");
    } else {
        return l("password-recovery.error.unknown", {errorStatus: error.status});
    }
}

export const PasswordRecoverySendEmailConfirmationCodeStep: FunctionComponent = observer(() => {
    const {
        passwordRecoveryEmailConfirmationCodeSending: {
            formErrors,
            formValues,
            setFormValue,
            pending,
            submitForm,
            error
        },
        passwordRecoveryDialog: {
            setPasswordRecoveryDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <DialogTitle>
                {l("password-recovery.enter-your-email")}
            </DialogTitle>
            <DialogContent>
                <TextField label={l("email")}
                           value={formValues.email}
                           onChange={event => setFormValue("email", event.target.value)}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.email)}
                           helperText={formErrors.email && l(formErrors.email)}
                />
                {error && (
                    <Typography style={{color: "red"}}>
                        {getErrorText(error, l)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setPasswordRecoveryDialogOpen(false)}
                >
                    {l("close")}
                </Button>
                <Button variant="contained"
                        onClick={submitForm}
                        color="primary"
                        disabled={pending}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("password-recovery.email-confirmation-code.send")}
                </Button>
            </DialogActions>
        </Fragment>
    )
});
