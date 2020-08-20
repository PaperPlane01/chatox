import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, TextField} from "@material-ui/core";
import {useLocalization, useStore} from "../../store/hooks";
import {ChangePasswordStep} from "../types";

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
