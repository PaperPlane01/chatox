import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useStore} from "../../store/hooks";
import {CheckEmailConfirmationCodeDialogContent} from "../../EmailConfirmation/components";

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
