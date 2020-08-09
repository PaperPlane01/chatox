import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    withMobileDialog,
    WithMobileDialog
} from "@material-ui/core";
import {MakrdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {localized, Localized} from "../../localization";
import {UpdateMessageFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {MapMobxToProps} from "../../store";
import {ApiError} from "../../api";

interface UpdateMessageDialogMobxProps {
    updatedMessageId?: string,
    updateMessageForm: UpdateMessageFormData,
    formErrors: FormErrors<UpdateMessageFormData>,
    pending: boolean,
    error?: ApiError,
    setUpdatedMessageId: (updatedMessageId?: string) => void,
    setFormValue: <Key extends keyof UpdateMessageFormData>(key: Key, value: UpdateMessageFormData[Key]) => void,
    updateMessage: () => void
}

type UpdateMessageDialogProps = UpdateMessageDialogMobxProps & Localized & WithMobileDialog;

const _UpdateMessageDialog: FunctionComponent<UpdateMessageDialogProps> = ({
    updatedMessageId,
    updateMessageForm,
    formErrors,
    pending,
    error,
    setUpdatedMessageId,
    updateMessage,
    setFormValue,
    fullScreen,
    l
}) => {
    if (!updatedMessageId) {
        return null;
    }

    return (
        <Dialog open={Boolean(updatedMessageId)}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
        >
            <DialogTitle>
                {l("message.edit")}
            </DialogTitle>
            <DialogContent>
                <TextField placeholder={l("message.type-something")}
                           value={updateMessageForm.text}
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
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setUpdatedMessageId(undefined)}
                        variant="outlined"
                        color="secondary"
                >
                    {l("close")}
                </Button>
                <Button onClick={updateMessage}
                        variant="contained"
                        color="primary"
                        disabled={pending}
                >
                    {pending && <CircularProgress size={20} color="primary"/>}
                    {l("chat.update.save-changes")}
                </Button>
            </DialogActions>
            <MakrdownPreviewDialog text={updateMessageForm.text}/>
        </Dialog>
    )
};

const mapMobxToProps: MapMobxToProps<UpdateMessageDialogMobxProps> = ({
    messageUpdate
}) => ({
    updatedMessageId: messageUpdate.updatedMessageId,
    updateMessageForm: messageUpdate.updateMessageForm,
    formErrors: messageUpdate.formErrors,
    pending: messageUpdate.pending,
    error: messageUpdate.error,
    setFormValue: messageUpdate.setFormValue,
    setUpdatedMessageId: messageUpdate.setUpdatedMessageId,
    updateMessage: messageUpdate.updateMessage
});

export const UpdateMessageDialog = withMobileDialog()(
    localized(inject(mapMobxToProps)(observer(_UpdateMessageDialog))) as FunctionComponent
);
