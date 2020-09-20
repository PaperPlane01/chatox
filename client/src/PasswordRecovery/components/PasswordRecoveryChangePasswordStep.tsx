import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    useTheme
} from "@material-ui/core";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("error.generic.server-unreachable");
    } else if (error.status === 410) {
        if (error.metadata) {
            switch (error.metadata.errorCode as string) {
                case "EMAIL_CONFIRMATION_CODE_HAS_BEEN_USED":
                    return l("password-recovery.error.email-confirmation-code-has-been-used");
                case "EMAIL_CONFIRMATION_CODE_EXPIRED":
                    return l("password-recovery.error.email-confirmation-code-expired");
                default:
                    return l("password-recovery.error.unknown", {errorStatus: error.status});
            }
        } else {
            return l("password-recovery.error.unknown", {errorStatus: error.status});
        }
    } else if (error.status === 403) {
        if (error.metadata && error.metadata.errorCode === "INVALID_EMAIL_CONFIRMATION_CODE") {
            return l("change-password.error.email-confirmation-code-invalid");
        } else {
            return l("password-recovery.error.unknown", {errorStatus: error.status});
        }
    } else {
        return l("password-recovery.error.unknown", {errorStatus: error.status});
    }
}

export const PasswordRecoveryChangePasswordStep: FunctionComponent = observer(() => {
    const {
        passwordRecoveryForm: {
            recoverPasswordForm,
            formErrors,
            pending,
            error,
            showPassword,
            setFormValue,
            recoverPassword,
            setShowPassword
        },
        passwordRecoveryDialog: {
            setPasswordRecoveryDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();
    const theme = useTheme();

    return (
        <Fragment>
            <DialogTitle>
                {l("change-password")}
            </DialogTitle>
            <DialogContent>
                <TextField label={l("change-password.new-password")}
                           value={recoverPasswordForm.password}
                           onChange={event => setFormValue("password", event.target.value)}
                           error={Boolean(formErrors.password)}
                           helperText={formErrors.password && l(formErrors.password)}
                           fullWidth
                           margin="dense"
                           type={showPassword ? "text" : "password"}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <IconButton onClick={() => setShowPassword(!showPassword)}>
                                           {showPassword ? <VisibilityOff/> : <Visibility/>}
                                       </IconButton>
                                   </InputAdornment>
                               )
                           }}
                />
                <TextField label={l("change-password.confirm-password")}
                           value={recoverPasswordForm.repeatedPassword}
                           onChange={event => setFormValue("repeatedPassword", event.target.value)}
                           error={Boolean(formErrors.repeatedPassword)}
                           helperText={formErrors.repeatedPassword && l(formErrors.repeatedPassword)}
                           fullWidth
                           margin="dense"
                           type={showPassword ? "text" : "password"}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <IconButton onClick={() => setShowPassword(!showPassword)}>
                                           {showPassword ? <VisibilityOff/> : <Visibility/>}
                                       </IconButton>
                                   </InputAdornment>
                               )
                           }}
                />
                {error && (
                    <Typography style={{color: theme.palette.error.main}}>
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
                        color="primary"
                        onClick={recoverPassword}
                        disabled={pending}
                >
                    {pending && <CircularProgress color="primary" size={15}/>}
                    {l("change-password")}
                </Button>
            </DialogActions>
        </Fragment>
    )
});
