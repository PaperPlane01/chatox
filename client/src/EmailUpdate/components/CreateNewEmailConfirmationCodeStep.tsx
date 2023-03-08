import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField
} from "@mui/material";
import {useLocalization, useStore} from "../../store";

export const CreateNewEmailConfirmationCodeStep: FunctionComponent = observer(() => {
    const {
        newEmailConfirmationCode: {
            pending,
            error,
            checkingEmailAvailability,
            formValues,
            formErrors,
            setFormValue,
            submitForm
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <DialogTitle>
                {l("email.update.enter-new-email")}
            </DialogTitle>
            <DialogContent>
                <TextField value={formValues.email}
                           onChange={event => setFormValue("email", event.target.value)}
                           error={Boolean(formErrors.email)}
                           label={l("email")}
                           helperText={formErrors.email && l(formErrors.email)}
                           fullWidth
                           margin="dense"
                           InputProps={{
                               endAdornment: checkingEmailAvailability && (
                                   <InputAdornment position="end">
                                       <CircularProgress size={15} color="primary"/>
                                   </InputAdornment>
                               )
                           }}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained"
                        color="primary"
                        onClick={submitForm}
                        disabled={pending || checkingEmailAvailability}
                >
                    {(pending || checkingEmailAvailability) && <CircularProgress size={15} color="primary"/>}
                    {l("registration.continue")}
                </Button>
            </DialogActions>
        </Fragment>
    )
})