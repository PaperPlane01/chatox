import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {RegistrationStep} from "../types";
import {useLocalization, useStore} from "../../store";

export const ConfirmSkippingEmailStep: FunctionComponent = observer(() => {
    const {
        registrationDialog: {
            setCurrentStep
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <DialogTitle>
                {l("registration.skip-email.are-you-sure")}
            </DialogTitle>
            <DialogContent>
                {l("registration.skip-email.limitations")}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        onClick={() => setCurrentStep(RegistrationStep.REGISTER)}
                >
                    {l("registration.continue-anyway")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={() => setCurrentStep(RegistrationStep.SEND_VERIFICATION_EMAIL)}
                >
                    {l("registration.skip-email.go-back")}
                </Button>
            </DialogActions>
        </Fragment>
    );
});
