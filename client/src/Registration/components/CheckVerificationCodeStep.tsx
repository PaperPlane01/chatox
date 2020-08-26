import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CheckEmailConfirmationCodeDialogContent} from "../../EmailConfirmation";
import {useStore} from "../../store";

export const CheckVerificationCodeStep: FunctionComponent = observer(() => {
    const {
        registrationEmailConfirmationCodeCheck,
        sendVerificationEmail: {
            emailConfirmationCodeResponse
        }
    } = useStore();

    return (
        <CheckEmailConfirmationCodeDialogContent checkEmailConfirmationCodeStore={registrationEmailConfirmationCodeCheck}
                                                 confirmationCodeId={emailConfirmationCodeResponse!.id}
        />
    );
});
