import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    Button,
    CircularProgress,
    Typography,
    TextField,
    FormControlLabel, Checkbox
} from "@material-ui/core"
import {DateTimePicker} from "@material-ui/pickers";
import {useSnackbar} from "notistack";
import {GlobalBanReasonSelect} from "./GlobalBanReasonSelect";
import {useLocalization, useStore} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";
import {getUserDisplayedName} from "../../User/utils/labels";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";

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
        entities: {
            users: {
                findById: findUser
            }
        },
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
    
    if (!updatedGlobalBan) {
        return null;
    }
    
    const closeDialog = (): void => {
        setUpdateGlobalBanDialogOpen(false);
        setUpdatedGlobalBanId(undefined);
    }
    
    const bannedUser = findUser(updatedGlobalBan.bannedUserId);

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
                                label={l("global.ban.expires-at")}
                                onChange={date => setFormValue("expiresAt", date || undefined)}
                                error={Boolean(formErrors.expiresAt)}
                                helperText={formErrors.expiresAt && l(formErrors.expiresAt)}
                                disabled={updateGlobalBanForm.permanent}
                                clearable
                                autoOk
                                format="dd MMMM yyyy HH:mm"
                                margin="dense"
                                fullWidth
                                disablePast
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
                           rowsMax={8}
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
    )
});
