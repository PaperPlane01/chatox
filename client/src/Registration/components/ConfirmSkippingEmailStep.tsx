import React, {Fragment, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Button, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {RegistrationStep} from "../types";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface ConfirmSkippingEmailStepMobxProps {
    setRegistrationStep: (registrationStep: RegistrationStep) => void
}

type ConfirmSkippingEmailStepProps = ConfirmSkippingEmailStepMobxProps & Localized;

const _ConfirmSkippingEmailStep: FunctionComponent<ConfirmSkippingEmailStepProps> = ({
    setRegistrationStep,
    l
}) => (
    <Fragment>
        <DialogTitle>
            {l("registration.skip-email.are-you-sure")}
        </DialogTitle>
        <DialogContent>
            {l("registration.skip-email.limitations")}
        </DialogContent>
        <DialogActions>
            <Button variant="outlined"
                    onClick={() => setRegistrationStep(RegistrationStep.REGISTER)}
            >
                {l("registration.continue-anyway")}
            </Button>
            <Button variant="contained"
                    color="primary"
                    onClick={() => setRegistrationStep(RegistrationStep.SEND_VERIFICATION_EMAIL)}
            >
                {l("registration.skip-email.go-back")}
            </Button>
        </DialogActions>
    </Fragment>
);

const mapMobxToProps: MapMobxToProps<ConfirmSkippingEmailStepMobxProps> = ({
    registrationDialog
}) => ({
    setRegistrationStep: registrationDialog.setCurrentStep
});

export const ConfirmSkippingEmailStep = localized(
    inject(mapMobxToProps)(observer(_ConfirmSkippingEmailStep))
) as FunctionComponent;
