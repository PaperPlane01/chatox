import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog} from "@material-ui/core";
import {useStore} from "../../store/hooks";
import {ChangePasswordStep} from "../types";
import {CheckEmailConfirmationCodeDialogContent} from "../../EmailConfirmation/components";
import {useMobileDialog} from "../../utils/hooks";

export const CheckPasswordChangeEmailConfirmationDialog: FunctionComponent = observer(() => {
    const {
        passwordChangeStep: {
            currentStep
        },
        passwordChangeEmailConfirmationCodeCheck,
        passwordChangeEmailConfirmationCodeSending: {
            emailConfirmationCodeResponse
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={currentStep === ChangePasswordStep.CHECK_EMAIL_CONFIRMATION_CODE}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
        >
            <CheckEmailConfirmationCodeDialogContent checkEmailConfirmationCodeStore={passwordChangeEmailConfirmationCodeCheck}
                                                     confirmationCodeId={emailConfirmationCodeResponse && emailConfirmationCodeResponse.id}
            />
        </Dialog>
    )
});
