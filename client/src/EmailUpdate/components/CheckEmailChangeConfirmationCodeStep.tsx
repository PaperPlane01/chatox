import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useStore} from "../../store";
import {CheckEmailConfirmationCodeDialogContent} from "../../EmailConfirmation";

export const CheckEmailChangeConfirmationCodeStep: FunctionComponent = observer(() => {
    const {
        emailChangeConfirmationCode: {
            emailConfirmationCode
        },
        emailChangeConfirmationCodeCheck
    } = useStore();

    return (
        <CheckEmailConfirmationCodeDialogContent checkEmailConfirmationCodeStore={emailChangeConfirmationCodeCheck}
                                                 confirmationCodeId={emailConfirmationCode && emailConfirmationCode.id}
        />
    );
});
