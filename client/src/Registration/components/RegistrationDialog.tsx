import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Dialog, withMobileDialog, WithMobileDialog} from "@material-ui/core";
import {SendVerificationEmailStep} from "./SendVerificationEmailStep";
import {ConfirmSkippingEmailStep} from "./ConfirmSkippingEmailStep";
import {CheckVerificationCodeStep} from "./CheckVerificationCodeStep";
import {RegisterStep} from "./RegisterStep";
import {RegistrationStep} from "../types";
import {MapMobxToProps} from "../../store";

const registrationDialogContentMap = {
    [RegistrationStep.SEND_VERIFICATION_EMAIL]: <SendVerificationEmailStep/>,
    [RegistrationStep.CONFIRM_SKIPPING_EMAIL]: <ConfirmSkippingEmailStep/>,
    [RegistrationStep.CHECK_VERIFICATION_CODE]: <CheckVerificationCodeStep/>,
    [RegistrationStep.REGISTER]: <RegisterStep/>
};

interface RegistrationDialogMobxProps {
    currentStep: RegistrationStep,
    registrationDialogOpen: boolean,
    setRegistrationDialogOpen: (registrationDialogOpen: boolean) => void
}

type RegistrationDialogProps = RegistrationDialogMobxProps & WithMobileDialog;

const _RegistrationDialog: FunctionComponent<RegistrationDialogProps> = ({
    currentStep,
    registrationDialogOpen,
    setRegistrationDialogOpen,
    fullScreen
}) => (
    <Dialog open={registrationDialogOpen}
            onClose={() => setRegistrationDialogOpen(false)}
            fullWidth
            maxWidth="md"
            fullScreen={fullScreen}
    >
        {registrationDialogContentMap[currentStep]}
    </Dialog>
);

const mapMobxToProps: MapMobxToProps<RegistrationDialogMobxProps> = ({
    registrationDialog
}) => ({
    currentStep: registrationDialog.currentStep,
    registrationDialogOpen: registrationDialog.registrationDialogOpen,
    setRegistrationDialogOpen: registrationDialog.setRegistrationDialogOpen
});

export const RegistrationDialog = withMobileDialog()(
    inject(mapMobxToProps)(observer(_RegistrationDialog) as FunctionComponent)
);
