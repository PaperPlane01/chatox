import React, {FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Dialog} from "@mui/material";
import {CheckEmailChangeConfirmationCodeStep} from "./CheckEmailChangeConfirmationCodeStep";
import {CheckNewEmailConfirmationCodeStep} from "./CheckNewEmailConfirmationCodeStep";
import {CreateChangeEmailConfirmationCodeStep} from "./CreateChangeEmailConfirmationCodeStep";
import {CreateNewEmailConfirmationCodeStep} from "./CreateNewEmailConfirmationCodeStep";
import {UpdateEmailPending} from "./UpdateEmailPending";
import {UpdateEmailErrorStep} from "./UpdateEmailErrorStep";
import {UpdateEmailStep} from "../types";
import {useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

type UpdateEmailDialogContent = {
    [Step in UpdateEmailStep]: ReactNode
}

const steps: UpdateEmailDialogContent = {
    [UpdateEmailStep.NONE]: null,
    [UpdateEmailStep.CREATE_CHANGE_EMAIL_CONFIRMATION_CODE]: <CreateChangeEmailConfirmationCodeStep/>,
    [UpdateEmailStep.CHECK_CHANGE_EMAIL_CONFIRMATION_CODE]: <CheckEmailChangeConfirmationCodeStep/>,
    [UpdateEmailStep.CREATE_NEW_EMAIL_CONFIRMATION_CODE]: <CreateNewEmailConfirmationCodeStep/>,
    [UpdateEmailStep.CHECK_NEW_EMAIL_CONFIRMATION_CODE]: <CheckNewEmailConfirmationCodeStep/>,
    [UpdateEmailStep.UPDATE_EMAIL]: <UpdateEmailPending/>,
    [UpdateEmailStep.ERROR]: <UpdateEmailErrorStep/>
};

export const UpdateEmailDialog: FunctionComponent = observer(() => {
    const {
        updateEmailDialog: {
            updateEmailDialogOpen,
            currentStep
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={updateEmailDialogOpen}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
        >
            {steps[currentStep]}
        </Dialog>
    );
});