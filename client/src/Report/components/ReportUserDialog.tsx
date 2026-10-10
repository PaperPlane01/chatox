import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CreateReportDialog} from "./CreateReportDialog";
import {useLocalization, useStore} from "../../store/hooks";

export const ReportUserDialog: FunctionComponent = observer(() => {
    const {
        reportUser: {
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
                               open={Boolean(reportedObjectId)}
                               title={l("report.user")}
                               onSubmit={submitForm}
                               onClose={handleClose}
                               onFormValueChange={setFormValue}
                               error={error}
    />;
});
