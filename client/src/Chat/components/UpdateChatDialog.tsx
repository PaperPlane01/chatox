import React, {Fragment, FunctionComponent, ReactNode} from "react";
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
    Typography,
    withMobileDialog
} from "@material-ui/core";
import ChipInput from "material-ui-chip-input";
import {useSnackbar} from "notistack";
import {ChatAvatarUpload} from "./ChatAvatarUpload";
import {MarkdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {Language, TranslationFunction} from "../../localization";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {useLocalization, useStore} from "../../store";

const notFoundErrorTranslations = {
    en: () => (
        <Typography variant="body1"
                    style={{color: "red"}}
        >
            Server responded with 404 status when tried to update chat. This may occur due to the following reasons:
            <ul>
                <li>
                    Chat you are trying to update no longer exists
                </li>
                <li>
                    If your update contains avatar image, it may have not been uploaded properly. Try to re-upload it
                </li>
            </ul>
        </Typography>
    ),
    ru: () => (
        <Typography variant="body1"
                    style={{color: "red"}}
        >
            При попытке обновить чат сервер ответил со статусом 404. Это может произойти по следующим причинам:
            <ul>
                <li>
                    Чат, который вы пытаетесь обновить, был удалён
                </li>
                <li>
                    Если вы пытаетесь поменять аватар чата, он мог быть загружен некорректно. Попытайтесь перезагрузить картинку
                </li>
            </ul>
        </Typography>
    )
};

const getErrorNode = (error: ApiError, l: TranslationFunction, language: Language): ReactNode => {
    if (error.status !== 404) {
        let errorText: string;

        if (error.status === 409) {
            errorText = l("chat.slug.has-already-been-taken");
        } else if (error.status === 403) {
            errorText = l("chat.update.no-permission");
        } else if (error.status === API_UNREACHABLE_STATUS) {
            errorText = l("chat.update.api-unreachable");
        } else {
            errorText = l("chat.update.unexpected-error", {errorStatus: error.status});
        }

        return (
            <Typography variant="body1"
                        style={{color: "red"}}
            >
                {errorText}
            </Typography>
        )
    } else {
        return notFoundErrorTranslations[language]();
    }
};

export const UpdateChatDialog: FunctionComponent = withMobileDialog()(observer(({fullScreen}) => {
    const {
        chat: {
            selectedChatId
        },
        chatUpdate: {
            updateChatForm,
            formErrors,
            updateChatDialogOpen,
            pending,
            checkingSlugAvailability,
            avatarUploadPending,
            error,
            showSnackbar,
            setShowSnackbar,
            setUpdateChatDialogOpen,
            setFormValue,
            updateChat
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l, locale} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    if (!selectedChatId) {
        return null;
    }

    if (showSnackbar) {
        enqueueSnackbar(l("chat.update.success"));
        setShowSnackbar(false);
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
                {error && getErrorNode(error, l, locale)}
            </DialogContent>
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
                        disabled={pending || avatarUploadPending || checkingSlugAvailability}
                >
                    {pending && <CircularProgress size={25} color="primary"/>}
                    {l("chat.update.save-changes")}
                </Button>
            </DialogActions>
            <MarkdownPreviewDialog text={updateChatForm.description || ""}/>
        </Dialog>
    )
})) as FunctionComponent;
