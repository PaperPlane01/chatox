import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {useSnackbar} from "notistack";
import {BanUserGloballyDialogBase} from "./BanUserGloballyDialogBase";
import {useLocalization, useStore} from "../../store";
import {getUserDisplayedName} from "../../User/utils/labels";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("global.ban.error.server-unreachable");
    } else if (error.status === 403) {
        return l("global.ban.error.no-permission");
    } else {
        return l("global.ban.error.unknown", {errorStatus: error.status});
    }
};

export const BanUserGloballyDialog: FunctionComponent = observer(() => {
    const {
        userGlobalBan: {
            banUserForm,
            pending,
            error,
            formErrors,
            banUserDialogOpen,
            bannedUserId,
            showSnackbar,
            setFormValue,
            setBanUserDialogOpen,
            banUser,
            setShowSnackbar
        },
        entities: {
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                enqueueSnackbar(l("global.ban.success"));
                setShowSnackbar(false);
            }
        }, [showSnackbar]
    );

    if (!bannedUserId) {
        return null;
    }

    const user = findUser(bannedUserId);

    return (
        <BanUserGloballyDialogBase formValues={banUserForm}
                                   formErrors={formErrors}
                                   open={banUserDialogOpen}
                                   pending={pending}
                                   error={error}
                                   title={l("global.ban.create.with-user", {username: getUserDisplayedName(user)})}
                                   onClose={() => setBanUserDialogOpen(false)}
                                   onSubmit={banUser}
                                   onFormValueChange={setFormValue}
                                   getErrorLabel={getErrorLabel}
        />
    );
});
