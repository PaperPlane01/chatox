import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from "@mui/material";
import {useSnackbar} from "notistack";
import {ChatDeletionReasonSelect} from "./ChatDeletionReasonSelect";
import {ChatDeletionStep} from "../types";
import {getChatDeletionErrorText} from "../utils";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const SpecifyChatDeletionReasonDialog: FunctionComponent = observer(() => {
    const {
        chatDeletion: {
            deleteChatForm,
            deleteChat,
            error,
            pending,
            formErrors,
            setFormValue,
            showSnackbar,
            setShowSnackbar,
            currentStep,
            setCurrentStep
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                enqueueSnackbar(l("chat.delete.success"));
                setShowSnackbar(true);
            }
        },
        [showSnackbar]
    );

    return (
        <Dialog open={currentStep === ChatDeletionStep.SPECIFY_DELETION_REASON}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
                onClose={() => setCurrentStep(ChatDeletionStep.NONE)}
        >
            <DialogTitle>
                {l("chat.delete.specify-reason")}
            </DialogTitle>
            <DialogContent>
                <ChatDeletionReasonSelect/>
                <TextField label={l("chat.delete.comment")}
                           value={deleteChatForm.comment || ""}
                           onChange={event => setFormValue("comment", event.target.value)}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.comment)}
                           helperText={formErrors.comment && l(formErrors.comment)}
                />
                {error && (
                    <Typography>
                        {getChatDeletionErrorText(error, l)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setCurrentStep(ChatDeletionStep.NONE)}
                        disabled={pending}
                >
                    {l("cancel")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={deleteChat}
                        disabled={pending}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("common.delete")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
