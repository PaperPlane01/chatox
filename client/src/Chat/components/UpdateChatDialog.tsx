import React, {Fragment, FunctionComponent} from "react";
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
    Typography,
    withMobileDialog,
    WithMobileDialog
} from "@material-ui/core";
import ChipInput from "material-ui-chip-input";
import {ChatAvatarUpload} from "./ChatAvatarUpload";
import {MakrdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {ChatOfCurrentUserEntity, TagErrorsMapContainer, UpdateChatFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {ApiError} from "../../api";
import {localized, Localized} from "../../localization";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {MapMobxToProps} from "../../store";

interface UpdateChatDialogMobxProps {
    updateChatForm: UpdateChatFormData,
    formErrors: FormErrors<UpdateChatFormData> & TagErrorsMapContainer,
    updateChatDialogOpen: boolean,
    pending: boolean,
    avatarUploadPending: boolean,
    checkingSlugAvailability: boolean,
    error?: ApiError,
    selectedChatId?: string,
    setFormValue: <Key extends keyof UpdateChatFormData>(key: Key, value: UpdateChatFormData[Key]) => void,
    updateChat: () => void,
    setUpdateChatDialogOpen: (updateChatDialogOpen: boolean) => void,
    findChat: (id: string) => ChatOfCurrentUserEntity
}

type UpdateChatDialogProps = UpdateChatDialogMobxProps & Localized & WithMobileDialog;

const _UpdateChatDialog: FunctionComponent<UpdateChatDialogProps> = ({
    updateChatForm,
    formErrors,
    updateChatDialogOpen,
    pending,
    checkingSlugAvailability,
    error,
    setUpdateChatDialogOpen,
    updateChat,
    setFormValue,
    selectedChatId,
    findChat,
    l,
    fullScreen
}) => {
    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    return (
        <Dialog open={updateChatDialogOpen}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
                onClose={() => setUpdateChatDialogOpen(false)}
        >
            <DialogTitle>
                {l("chat.update", {chatName: chat.name})}
            </DialogTitle>
            <DialogContent>
                <ChatAvatarUpload/>
                <TextField label={l("chat.name")}
                           value={updateChatForm.name}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.name)}
                           helperText={formErrors.name && l(formErrors.name)}
                           onChange={event => setFormValue("name", event.target.value)}
                />
                <TextField label={l("chat.description")}
                           value={updateChatForm.description}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.description)}
                           helperText={formErrors.description && l(formErrors.description)}
                           onChange={event => setFormValue("description", event.target.value)}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <OpenMarkdownPreviewDialogButton/>
                                   </InputAdornment>
                               )
                           }}
                           multiline
                           rows={4}
                           rowsMax={20}
                />
                <TextField label={l("chat.slug")}
                           value={updateChatForm.slug}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.slug)}
                           helperText={formErrors.slug && l(formErrors.slug)}
                           onChange={event => setFormValue("slug", event.target.value)}
                           InputProps={{
                               endAdornment: checkingSlugAvailability && (
                                   <InputAdornment position="end">
                                       <CircularProgress size={15} color="primary"/>
                                   </InputAdornment>
                               )
                           }}
                />
                <ChipInput label={l("chat.tags")}
                           value={updateChatForm.tags}
                           fullWidth
                           margin="dense"
                           error={Boolean(
                               formErrors.tags || containsNotUndefinedValues(formErrors.tagErrorsMap)
                           )}
                           helperText={
                               formErrors.tags ? l(formErrors.tags)
                                   : containsNotUndefinedValues(formErrors.tagErrorsMap)
                                   ? (
                                       <Fragment>
                                           {Object.keys(formErrors.tagErrorsMap).map(key => (
                                               <Typography>
                                                   {formErrors.tagErrorsMap[key]
                                                   && l(formErrors.tagErrorsMap[key]!, {tag: key})}
                                               </Typography>
                                           ))}
                                       </Fragment>
                                   )
                                   : null
                           }
                           onChange={tags => setFormValue("tags", tags as string[])}
                />
                <DialogActions>
                    <Button variant="outlined"
                            color="secondary"
                            onClick={() => setUpdateChatDialogOpen(false)}
                    >
                        {l("close")}
                    </Button>
                    <Button variant="contained"
                            color="primary"
                            onClick={() => updateChat()}
                            disabled={pending}
                    >
                        {pending && <CircularProgress size={25} color="primary"/>}
                        {l("chat.update.save-changes")}
                    </Button>
                </DialogActions>
            </DialogContent>
            <MakrdownPreviewDialog text={updateChatForm.description || ""}/>
        </Dialog>
    )
};

const mapMobxToProps: MapMobxToProps<UpdateChatDialogMobxProps> = ({
    chatUpdate,
    chat,
    entities
}) => ({
    updateChatDialogOpen: chatUpdate.updateChatDialogOpen,
    updateChatForm: chatUpdate.updateChatForm,
    formErrors: chatUpdate.formErrors,
    pending: chatUpdate.pending,
    avatarUploadPending: chatUpdate.avatarUploadPending,
    checkingSlugAvailability: chatUpdate.checkingSlugAvailability,
    error: chatUpdate.error,
    selectedChatId: chat.selectedChatId,
    setFormValue: chatUpdate.setFormValue,
    setUpdateChatDialogOpen: chatUpdate.setUpdateChatDialogOpen,
    updateChat: chatUpdate.updateChat,
    findChat: entities.chats.findById
});

export const UpdateChatDialog = withMobileDialog()(
    localized(
        inject(mapMobxToProps)(observer(_UpdateChatDialog))
    ) as FunctionComponent
);
