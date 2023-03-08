import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store";
import {BanUserGloballyDialogBase} from "../../GlobalBan";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("report.user.action.ban-users.error.server-unreachable");
    } else {
        return l("report.messages.ban-users.error.unknown", {errorStatus: error.status});
    }
};

export const BanReportedUsersDialog: FunctionComponent = observer(() => {
    const {
        selectedReportedUsersBan: {
            formValues,
            formErrors,
            submitForm,
            banUsersDialogOpen,
            setBanUsersDialogOpen,
            setFormValue,
            pending,
            error,
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                enqueueSnackbar(l("report.user.action.ban-users.success"));
                setShowSnackbar(false);
            }
        }
    );

    return (
        <BanUserGloballyDialogBase formValues={formValues}
                                   formErrors={formErrors}
                                   open={banUsersDialogOpen}
                                   pending={pending}
                                   title={l("report.user.action.ban-users")}
                                   submitButtonLabel={l("report.user.action.ban-users")}
                                   onClose={() => setBanUsersDialogOpen(false)}
                                   onSubmit={submitForm}
                                   onFormValueChange={setFormValue}
                                   getErrorLabel={getErrorLabel}
                                   error={error}
        />
    );
});
