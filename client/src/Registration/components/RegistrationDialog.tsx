import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog} from "@material-ui/core";
import {SendVerificationEmailStep} from "./SendVerificationEmailStep";
import {ConfirmSkippingEmailStep} from "./ConfirmSkippingEmailStep";
import {CheckVerificationCodeStep} from "./CheckVerificationCodeStep";
import {RegisterStep} from "./RegisterStep";
import {RegistrationStep} from "../types";
import {useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

const registrationDialogContentMap = {
    [RegistrationStep.SEND_VERIFICATION_EMAIL]: <SendVerificationEmailStep/>,
    [RegistrationStep.CONFIRM_SKIPPING_EMAIL]: <ConfirmSkippingEmailStep/>,
    [RegistrationStep.CHECK_VERIFICATION_CODE]: <CheckVerificationCodeStep/>,
    [RegistrationStep.REGISTER]: <RegisterStep/>
};

export const RegistrationDialog: FunctionComponent = observer(() => {
    const {
        registrationDialog: {
            currentStep,
            registrationDialogOpen,
            setRegistrationDialogOpen
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={registrationDialogOpen}
                onClose={() => setRegistrationDialogOpen(false)}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
        >
            {registrationDialogContentMap[currentStep]}
        </Dialog>
    );
});
