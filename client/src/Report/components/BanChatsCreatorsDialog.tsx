import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store/hooks";
import {BanUserGloballyDialogBase} from "../../GlobalBan";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("report.chat.action.ban-chats-creators.error.server-unreachable");
    } else {
        return l("report.chat.action.ban-chats-creators.error.unknown", {errorStatus: error.status});
    }
};

export const BanChatsCreatorsDialog: FunctionComponent = observer(() => {
    const {
        selectedReportedChatsCreatorsBan: {
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

    useEffect(() => {
        if (showSnackbar) {
            enqueueSnackbar(l("report.chat.action.ban-chats-creators.success"));
            setShowSnackbar(false);
        }
    });

    return (
        <BanUserGloballyDialogBase formValues={formValues}
                                   formErrors={formErrors}
                                   open={banUsersDialogOpen}
                                   pending={pending}
                                   title={l("report.chat.action.ban-chats-creators")}
                                   onClose={() => setBanUsersDialogOpen(false)}
                                   onSubmit={submitForm}
                                   onFormValueChange={setFormValue}
                                   getErrorLabel={getErrorLabel}
                                   error={error}
                                   submitButtonLabel={l("report.chat.action.ban-chats-creators")}
        />
    );
});
