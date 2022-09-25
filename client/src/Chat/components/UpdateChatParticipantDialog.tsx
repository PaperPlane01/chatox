import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {DialogTitle, Dialog, DialogContent, DialogActions, Button, CircularProgress, Typography} from "@mui/material";
import {ChatRoleSelect} from "./ChatRoleSelect";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {useSnackbar} from "notistack";
import {getUserDisplayedName} from "../../User/utils/labels";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("chat.participant.update.error.server-unreachable");
    } else {
        return l("chat.participant.update.error.unknown-error", {errorStatus: error.status});
    }
};

export const UpdateChatParticipantDialog: FunctionComponent = observer(() => {
    const {
        updateChatParticipant: {
            formValues,
            updatedParticipant,
            updateChatParticipantDialogOpen,
            pending,
            error,
            showSnackbar,
            assignableRoles,
            fetchingChatRoles,
            setUpdatedParticipantId,
            setUpdateChatParticipantDialogOpen,
            setShowSnackbar,
            setFormValue,
            submitForm
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
                setShowSnackbar(false);
                enqueueSnackbar(l("chat.participant.update.success"));
            }
        }
    )

    if (!updatedParticipant) {
        return null;
    }

    const updatedUser = findUser(updatedParticipant.userId);

    const handleClose = (): void => {
        setUpdateChatParticipantDialogOpen(false);
        setUpdatedParticipantId(undefined);
    };

    return (
        <Dialog open={updateChatParticipantDialogOpen}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
                onClose={handleClose}
        >
            <DialogTitle>
                {l("chat.participant.update.with-username", {username: getUserDisplayedName(updatedUser)})}
            </DialogTitle>
            <DialogContent>
                <ChatRoleSelect onSelect={chatRole => setFormValue("roleId", chatRole)}
                                label={l("chat.participant.role")}
                                value={formValues.roleId}
                                rolesIds={assignableRoles}
                                pending={fetchingChatRoles}
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
                        onClick={handleClose}
                >
                    {l("close")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={submitForm}
                        disabled={pending}
                >
                    {pending && <CircularProgress size={25} color="primary"/>}
                    {l("save-changes")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
