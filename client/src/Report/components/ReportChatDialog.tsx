import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CreateReportDialog} from "./CreateReportDialog";
import {useLocalization, useStore} from "../../store";

export const ReportChatDialog: FunctionComponent = observer(() => {
    const {
        reportChat: {
            reportedObjectId,
            formValues,
            formErrors,
            showSuccessMessage,
            error,
            pending,
            setShowSuccessMessage,
            setReportedObjectId,
            setFormValue,
            submitForm
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClose = (): void => {
        setReportedObjectId(undefined);
        setShowSuccessMessage(false);
    };

    return <CreateReportDialog formValues={formValues}
                               formErrors={formErrors}
                               showSuccessMessage={showSuccessMessage}
                               pending={pending}
                               error={error}
                               open={Boolean(reportedObjectId)}
                               title={l("report.chat")}
                               onSubmit={submitForm}
                               onClose={handleClose}
                               onFormValueChange={setFormValue}
    />
});
