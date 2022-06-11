import React, {FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Dialog} from "@mui/material";
import {PasswordRecoverySendEmailConfirmationCodeStep} from "./PasswordRecoverySendEmailConfirmationCodeStep";
import {PasswordRecoveryCheckEmailConfirmationCodeStep} from "./PasswordRecoveryCheckEmailConfirmationCodeStep";
import {PasswordRecoveryChangePasswordStep} from "./PasswordRecoveryChangePasswordStep";
import {PasswordRecoveryCompletedStep} from "./PasswordRecoveryCompletedStep";
import {PasswordRecoveryStep} from "../types";
import {useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

type RecoverPasswordStepsMap = {
    [key in PasswordRecoveryStep]: ReactNode
}

const recoverPasswordStepsMap: RecoverPasswordStepsMap = {
    [PasswordRecoveryStep.CREATE_EMAIL_CONFIRMATION_CODE]: <PasswordRecoverySendEmailConfirmationCodeStep/>,
    [PasswordRecoveryStep.CHECK_EMAIL_CONFIRMATION_CODE]: <PasswordRecoveryCheckEmailConfirmationCodeStep/>,
    [PasswordRecoveryStep.CHANGE_PASSWORD]: <PasswordRecoveryChangePasswordStep/>,
    [PasswordRecoveryStep.PASSWORD_RECOVERY_COMPLETED]: <PasswordRecoveryCompletedStep/>,
    [PasswordRecoveryStep.NONE]: null
};

export const PasswordRecoveryDialog: FunctionComponent = observer(() => {
    const {
        passwordRecoveryDialog: {
            currentStep,
            passwordRecoveryDialogOpen,
            setPasswordRecoveryDialogOpen
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={passwordRecoveryDialogOpen}
                onClose={() => setPasswordRecoveryDialogOpen(false)}
                fullWidth
                maxWidth="sm"
                fullScreen={fullScreen}
        >
            {recoverPasswordStepsMap[currentStep]}
        </Dialog>
    );
});
