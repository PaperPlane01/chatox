import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Typography} from "@mui/material";
import {CheckEmailConfirmationCodeStore} from "../stores";
import {useLocalization} from "../../store";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

interface CheckEmailConfirmationCodeDialogContentProps {
    confirmationCodeId?: string,
    checkEmailConfirmationCodeStore: CheckEmailConfirmationCodeStore,
    closeable?: boolean,
    onClose?: () => void
}

const getErrorText = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === 410) {
        return l("email.verification.code.expired");
    } else if (apiError.status === API_UNREACHABLE_STATUS) {
        return l("email.verification.server-unreachable");
    } else return l("email.verification.unknown-error", {errorStatus: apiError.status});
};


export const CheckEmailConfirmationCodeDialogContent: FunctionComponent<CheckEmailConfirmationCodeDialogContentProps>
    = observer(({
                    checkEmailConfirmationCodeStore,
                    confirmationCodeId,
                    closeable = false,
                    onClose
    }) => {
        const {l} = useLocalization();
        const {
            setFormValue,
            pending,
            error,
            formErrors,
            checkEmailConfirmationCodeForm,
            checkEmailConfirmationCode
        } = checkEmailConfirmationCodeStore;

        if (!confirmationCodeId) {
            return null;
        }

        const handleClose = (): void => {
            if (closeable && onClose) {
                onClose();
            }
        };

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
                               value={checkEmailConfirmationCodeForm.confirmationCode}
                               fullWidth
                               margin="dense"
                               error={Boolean(formErrors.confirmationCode)}
                               helperText={formErrors.confirmationCode && l(formErrors.confirmationCode)}
                               onChange={event => setFormValue("confirmationCode", event.target.value)}
                    />
                    {error && (
                        <Typography style={{color: "red"}}>
                            {getErrorText(error, l)}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    {closeable && (
                        <Button variant="outlined"
                                color="secondary"
                                onClick={handleClose}
                        >
                            {l("close")}
                        </Button>
                    )}
                    <Button variant="contained"
                            color="primary"
                            disabled={pending}
                            onClick={() => checkEmailConfirmationCode(confirmationCodeId)}
                    >
                        {pending && <CircularProgress size={25} color="primary"/>}
                        {l("registration.continue")}
                    </Button>
                </DialogActions>
            </Fragment>
        );
});
