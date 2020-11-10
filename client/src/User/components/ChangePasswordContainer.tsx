import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {ChangePasswordForm} from "./ChangePasswordForm";
import {CheckPasswordChangeEmailConfirmationDialog} from "./CheckPasswordChangeEmailConfirmationDialog";
import {EmailConfirmationCodeCreationPendingDialog} from "../../EmailConfirmation";
import {useStore} from "../../store/hooks";

export const ChangePasswordContainer: FunctionComponent = observer(() => {
    const {
        passwordChangeEmailConfirmationCodeSending: {
            pending,
            error
        }
    } = useStore();

    return (
        <Fragment>
            <ChangePasswordForm/>
            <CheckPasswordChangeEmailConfirmationDialog/>
            <EmailConfirmationCodeCreationPendingDialog pending={pending}
                                                        error={error}
            />
        </Fragment>
    )
})
