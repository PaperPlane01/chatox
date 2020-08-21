import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, TextField, Typography} from "@material-ui/core";
import {ChangePasswordStep} from "../types";
import {useLocalization, useStore} from "../../store/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {Labels, TranslationFunction} from "../../localization";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    let errorCode: keyof Labels = "change-password.error.unknown-error";

    if (error.status === 403 && error.metadata) {
        switch (error.metadata.errorCode) {
            case "INVALID_PASSWORD":
                errorCode = "change-password.error.wrong-password";
                break;
            case "EMAIL_MISMATCH":
                errorCode = "change-password.error.email-mismatch";
                break;
            case "INVALID_EMAIL_CONFIRMATION_CODE":
                errorCode = "change-password.error.email-confirmation-code-invalid";
                break;
        }
    } else if (error.status === 410) {
        errorCode = "change-password.error.email-confirmation-code-expired";
    } else if (error.status === API_UNREACHABLE_STATUS) {
        errorCode = "change-password.error.server-unreachable";
    }

    return l(errorCode);
}

export const ChangePasswordForm: FunctionComponent = observer(() => {
    const {
        passwordChangeForm: {
            passwordChangeForm,
            formErrors,
            pending,
            error,
            setFormValue
        },
        passwordChangeStep: {
            setCurrentStep
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            <CardHeader title={l("change-password")}/>
            <CardContent>
                <TextField label={l("change-password.current-password")}
                           value={passwordChangeForm.currentPassword}
                           onChange={event => setFormValue("currentPassword", event.target.value)}
                           error={Boolean(formErrors.currentPassword)}
                           helperText={formErrors.currentPassword && l(formErrors.currentPassword)}
                           fullWidth
                           margin="dense"
                />
                <TextField label={l("change-password.new-password")}
                           value={passwordChangeForm.password}
                           onChange={event => setFormValue("password", event.target.value)}
                           error={Boolean(formErrors.password)}
                           helperText={formErrors.password && l(formErrors.password)}
                           fullWidth
                           margin="dense"
                />
                <TextField label={l("change-password.confirm-password")}
                           value={passwordChangeForm.repeatedPassword}
                           onChange={event => setFormValue("repeatedPassword", event.target.value)}
                           error={Boolean(formErrors.repeatedPassword)}
                           helperText={formErrors.repeatedPassword && l(formErrors.repeatedPassword)}
                           fullWidth
                           margin="dense"
                />
                {error && (
                    <Typography style={{color: "red"}}>
                        {getErrorText(error, l)}
                    </Typography>
                )}
            </CardContent>
            <CardActions>
                <Button variant="contained"
                        color="primary"
                        onClick={() => setCurrentStep(ChangePasswordStep.VALIDATE_FORM_AND_CHECK_IF_CONFIRMATION_CODE_SHOULD_BE_SENT)}
                        disabled={pending}
                >
                    {l("change-password")}
                </Button>
            </CardActions>
        </Card>
    )
});
