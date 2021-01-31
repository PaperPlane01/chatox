import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    TextField,
    Typography
} from "@material-ui/core";
import {DateTimePicker} from "@material-ui/pickers";
import {useSnackbar} from "notistack";
import {GlobalBanReasonSelect} from "./GlobalBanReasonSelect";
import {useLocalization, useStore} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";
import {getUserDisplayedName} from "../../User/utils/get-user-displayed-name";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";

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
    const {fullScreen} = useMobileDialog();
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
        <Dialog open={banUserDialogOpen}
                onClose={() => setBanUserDialogOpen(false)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="lg"
        >
            <DialogTitle>
                {l("global.ban.create.with-user", {username: getUserDisplayedName(user)})}
            </DialogTitle>
            <DialogContent>
                <DateTimePicker value={banUserForm.expiresAt || null}
                                label={l("global.ban.expires-at")}
                                onChange={date => setFormValue("expiresAt", date || undefined)}
                                error={Boolean(formErrors.expiresAt)}
                                helperText={formErrors.expiresAt && l(formErrors.expiresAt)}
                                disabled={banUserForm.permanent}
                                clearable
                                autoOk
                                format="dd MMMM yyyy HH:mm"
                                margin="dense"
                                fullWidth
                                disablePast
                />
                <GlobalBanReasonSelect onSelect={reason => setFormValue("reason", reason)}
                                       value={banUserForm.reason}
                />
                <TextField label={l("global.ban.comment")}
                           value={banUserForm.comment}
                           onChange={event => setFormValue("comment", event.target.value)}
                           error={Boolean(formErrors.comment)}
                           helperText={formErrors.comment && l(formErrors.comment)}
                           multiline
                           rows={4}
                           rowsMax={8}
                           fullWidth
                           margin="dense"
                />
                <FormControlLabel control={
                    <Checkbox checked={banUserForm.permanent}
                              onChange={event => setFormValue("permanent", event.target.checked)}
                    />
                }
                                  label={l("global.ban.permanent")}
                />
                {error && (
                    <Typography style={{color: "red"}}>
                        {getErrorLabel(error, l)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setBanUserDialogOpen(false)}
                >
                    {l("close")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={banUser}
                        disabled={pending}
                >
                    {pending && <CircularProgress color="primary" size={15}/>}
                    {l("global.ban.create")}
                </Button>
            </DialogActions>
        </Dialog>
    )
});
