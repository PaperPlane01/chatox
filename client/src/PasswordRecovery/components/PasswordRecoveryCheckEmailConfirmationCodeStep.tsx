import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CheckEmailConfirmationCodeDialogContent} from "../../EmailConfirmation";
import {useStore} from "../../store/hooks";

export const PasswordRecoveryCheckEmailConfirmationCodeStep: FunctionComponent = observer(() => {
    const {
        passwordRecoveryEmailConfirmationCodeSending: {
            emailConfirmationCode
        },
        passwordRecoveryEmailConfirmationCodeCheck
    } = useStore();

    return (
        <CheckEmailConfirmationCodeDialogContent checkEmailConfirmationCodeStore={passwordRecoveryEmailConfirmationCodeCheck}
                                                 confirmationCodeId={emailConfirmationCode && emailConfirmationCode.id}
        />
    )
})
