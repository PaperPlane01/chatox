import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useStore} from "../../store";
import {CheckEmailConfirmationCodeDialogContent} from "../../EmailConfirmation";

export const CheckNewEmailConfirmationCodeStep: FunctionComponent = observer(() => {
    const {
        newEmailConfirmationCode: {
            emailConfirmationCode
        },
        newEmailConfirmationCodeCheck
    } = useStore();

    return (
        <CheckEmailConfirmationCodeDialogContent checkEmailConfirmationCodeStore={newEmailConfirmationCodeCheck}
                                                 confirmationCodeId={emailConfirmationCode && emailConfirmationCode.id}
        />
    );
});
