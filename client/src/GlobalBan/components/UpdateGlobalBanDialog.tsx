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
} from "@mui/material";
import {DateTimePicker} from "@mui/x-date-pickers";
import {useSnackbar} from "notistack";
import {GlobalBanReasonSelect} from "./GlobalBanReasonSelect";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useMobileDialog} from "../../utils/hooks";
import {getUserDisplayedName} from "../../User/utils/labels";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === 403) {
        return l("global.ban.update.error.no-permission");
    } else if (error.status === API_UNREACHABLE_STATUS) {
        return l("global.ban.update.error.server-unreachable");
    } else {
        return l("global.ban.update.error.unknown", {errorStatus: error.status});
    }
}

export const UpdateGlobalBanDialog: FunctionComponent = observer(() => {
    const {
        updateGlobalBan: {
            updateGlobalBanDialogOpen,
            updatedGlobalBan,
            showSnackbar,
            updateGlobalBanForm,
            formErrors,
            error,
            pending,
            setFormValue,
            setUpdatedGlobalBanId,
            setUpdateGlobalBanDialogOpen,
            setShowSnackbar,
            updateGlobalBan
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar()
    const {fullScreen} = useMobileDialog();
    
    useEffect(
        () => {
            if (showSnackbar) {
                enqueueSnackbar(l("global.ban.update.success"));
                setShowSnackbar(false);
            }
        }
    );

    const bannedUser = useEntityById("users", updatedGlobalBan?.bannedUserId);

    if (!bannedUser) {
        return null;
    }

    const closeDialog = (): void => {
        setUpdateGlobalBanDialogOpen(false);
        setUpdatedGlobalBanId(undefined);
    }

    return (
        <Dialog open={updateGlobalBanDialogOpen}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
                onClose={closeDialog}
        >
            <DialogTitle>
                {l("global.ban.update.with-user", {username: getUserDisplayedName(bannedUser)})}
            </DialogTitle>
            <DialogContent>
                <DateTimePicker value={updateGlobalBanForm.expiresAt || null}
                                onChange={date => setFormValue("expiresAt", date || undefined)}
                                disabled={updateGlobalBanForm.permanent}
                                inputFormat="dd MMMM yyyy HH:mm"
                                disablePast
                                renderInput={props => (
                                    <TextField {...props}
                                               label={l("global.ban.expires-at")}
                                               error={Boolean(formErrors.expiresAt)}
                                               helperText={formErrors.expiresAt && l(formErrors.expiresAt)}
                                               margin="dense"
                                               fullWidth
                                    />
                                )}
                />
                <GlobalBanReasonSelect onSelect={reason => setFormValue("reason", reason)}
                                       value={updateGlobalBanForm.reason}
                />
                <TextField label={l("global.ban.comment")}
                           value={updateGlobalBanForm.comment}
                           onChange={event => setFormValue("comment", event.target.value)}
                           error={Boolean(formErrors.comment)}
                           helperText={formErrors.comment && l(formErrors.comment)}
                           multiline
                           rows={4}
                           maxRows={8}
                           fullWidth
                           margin="dense"
                />
                <FormControlLabel control={
                    <Checkbox checked={updateGlobalBanForm.permanent}
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
                        onClick={closeDialog}
                >
                    {l("close")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={updateGlobalBan}
                        disabled={pending}
                >
                    {pending && <CircularProgress color="primary" size={15}/>}
                    {l("chat.update.save-changes")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
