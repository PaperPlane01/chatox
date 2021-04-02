import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    Typography
} from "@material-ui/core";
import {DateTimePicker} from "@material-ui/pickers";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";
import {MarkdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown/components";
import {addMinutes, addMonths} from "date-fns";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.metadata && error.metadata.errorCode) {
        if (error.metadata.errorCode === "LIMIT_OF_SCHEDULED_MESSAGES_REACHED") {
            return l("message.delayed-message.limit-reached");
        } else if (error.metadata.errorCode === "SCHEDULED_MESSAGE_IS_TOO_CLOSE_TO_ANOTHER_SCHEDULED_MESSAGE") {
            return l("message.delayed-message.is-too-close-to-other-delayed-message");
        }
    }

    switch (error.status) {
        case API_UNREACHABLE_STATUS:
            return l("message.delayed-message.update.server-unreachable");
        case 404:
            return l("message.delayed-message.update.error.deleted-or-published");
        default:
            return l("message.delayed-message.update.error.unknown", {errorStatus: error.status});
    }
};

export const UpdateScheduledMessageDialog: FunctionComponent = observer(() => {
    const {
        updateScheduledMessage: {
            setFormValue,
            setMessageId,
            updateScheduledMessageDialogOpen,
            setUpdateMessageDialogOpen,
            formValues,
            formErrors,
            submitForm,
            pending,
            error,
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();
    const {enqueueSnackbar} = useSnackbar();

    const closeDialog = (): void => {
        setUpdateMessageDialogOpen(false);
        setMessageId(undefined);
    };

    useEffect(
        () => {
            if (showSnackbar) {
                closeDialog();
                setShowSnackbar(false);
                enqueueSnackbar(l("message.delayed-message.update.success"));
            }
        }
    );

    return (
        <Dialog open={updateScheduledMessageDialogOpen}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
                onClose={closeDialog}
        >
            <DialogTitle>
                {l("message.delayed-message.update")}
            </DialogTitle>
            <DialogContent>
                <TextField placeholder={l("message.type-something")}
                           value={formValues.text}
                           onChange={event => setFormValue("text", event.target.value)}
                           error={Boolean(formErrors.text)}
                           helperText={formErrors.text && l(formErrors.text)}
                           fullWidth
                           margin="dense"
                           multiline
                           rows={4}
                           rowsMax={Number.MAX_SAFE_INTEGER}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <OpenMarkdownPreviewDialogButton/>
                                   </InputAdornment>
                               )
                           }}
                />
                <DateTimePicker value={formValues.scheduledAt}
                                onChange={date => setFormValue("scheduledAt", date!)}
                                openTo="date"
                                format="dd MMMM yyyy HH:mm"
                                minDate={addMinutes(new Date(), 5)}
                                maxDate={addMonths(new Date(), 1)}
                                disablePast
                                fullWidth
                                margin="dense"
                                error={Boolean(
                                    formErrors.scheduledAt
                                    || (error && error.metadata
                                    && error.metadata.errorCode
                                    && error.metadata.errorCode === "SCHEDULED_MESSAGE_IS_TOO_CLOSE_TO_ANOTHER_SCHEDULED_MESSAGE")
                                )}
                                helperText={formErrors.scheduledAt && l(formErrors.scheduledAt)}
                                ampm={false}
                />
                <Typography style={{color: "red"}}>
                    {error && getErrorText(error, l)}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeDialog}
                        variant="outlined"
                        color="secondary"
                >
                    {l("close")}
                </Button>
                <Button onClick={submitForm}
                        variant="contained"
                        color="primary"
                        disabled={pending}
                >
                    {pending && <CircularProgress color="primary" size={15}/>}
                    {l("save-changes")}
                </Button>
            </DialogActions>
            <MarkdownPreviewDialog text={formValues.text}/>
        </Dialog>
    );
});
