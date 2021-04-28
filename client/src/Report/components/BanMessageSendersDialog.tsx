import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store/hooks";
import {BanUserGloballyDialogBase} from "../../GlobalBan";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("report.messages.ban-users.error.server-unreachable");
    } else {
        return l("report.messages.ban-users.error.unknown", {errorStatus: error.status});
    }
};

export const BanMessageSendersDialog: FunctionComponent = observer(() => {
    const {
        selectedReportedMessagesSendersBan: {
            formValues,
            formErrors,
            submitForm,
            banSendersOfSelectedMessagesDialogOpen,
            setBanSendersOfSelectedMessagesDialogOpen,
            setFormValue,
            pending,
            error,
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (showSnackbar) {
            enqueueSnackbar(l("report.messages.ban-users.success"));
            setShowSnackbar(false);
        }
    });

    return (
        <BanUserGloballyDialogBase formValues={formValues}
                                   formErrors={formErrors}
                                   open={banSendersOfSelectedMessagesDialogOpen}
                                   pending={pending}
                                   title={l("report.messages.ban-users")}
                                   onClose={() => setBanSendersOfSelectedMessagesDialogOpen(false)}
                                   onSubmit={submitForm}
                                   onFormValueChange={setFormValue}
                                   getErrorLabel={getErrorLabel}
                                   error={error}
                                   submitButtonLabel={l("report.messages.ban-users")}
        />
    );
});
