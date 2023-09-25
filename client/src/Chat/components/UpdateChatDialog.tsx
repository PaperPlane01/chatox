import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    InputAdornment,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import {useSnackbar} from "notistack";
import {ChatAvatarUpload} from "./ChatAvatarUpload";
import {ChipInput} from "../../ChipInput";
import {MarkdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {TimeUnitSelect} from "../../TimeUnitSelect";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TimeUnit} from "../../api/types/response";
import {Language, TranslationFunction} from "../../localization";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

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

export const UpdateChatDialog: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        chatUpdate: {
            formValues,
            formErrors,
            tagsErrorsMap,
            updateChatDialogOpen,
            pending,
            checkingSlugAvailability,
            avatarUploadPending,
            error,
            showSnackbar,
            setShowSnackbar,
            setUpdateChatDialogOpen,
            setFormValue,
            submitForm
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l, locale} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();
    const {fullScreen} = useMobileDialog();

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
                           value={formValues.name}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.name)}
                           helperText={formErrors.name && l(formErrors.name)}
                           onChange={event => setFormValue("name", event.target.value)}
                />
                <TextField label={l("chat.description")}
                           value={formValues.description}
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
                           maxRows={20}
                />
                <TextField label={l("chat.slug")}
                           value={formValues.slug}
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
                           value={formValues.tags}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.tags || containsNotUndefinedValues(tagsErrorsMap))}
                           helperText={
                               formErrors.tags ? l(formErrors.tags)
                                   : containsNotUndefinedValues(tagsErrorsMap)
                                   ? (
                                       <Fragment>
                                           {Object.keys(tagsErrorsMap).map(key => (
                                               <Typography>
                                                   {tagsErrorsMap[key]
                                                   && l(tagsErrorsMap[key]!, {tag: key})}
                                               </Typography>
                                           ))}
                                       </Fragment>
                                   )
                                   : null
                           }
                           onChange={tags => setFormValue("tags", tags as string[])}
                />
                <FormControlLabel control={
                    <Switch checked={formValues.slowModeEnabled}
                            onChange={event => setFormValue("slowModeEnabled", event.target.checked)}
                    />
                }
                                  label={l("chat.slow-mode.enabled")}
                />
                <TextField label={l("chat.slow-mode.interval")}
                           value={formValues.slowModeInterval}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.slowModeInterval)}
                           helperText={formErrors.slowModeInterval && l(formErrors.slowModeInterval)}
                           onChange={event => setFormValue("slowModeInterval", event.target.value)}
                />
                <TimeUnitSelect value={formValues.slowModeUnit}
                                onSelect={timeUnit => setFormValue("slowModeUnit", timeUnit)}
                                onClear={() => setFormValue("slowModeUnit", undefined)}
                                allowedUnits={[TimeUnit.SECONDS, TimeUnit.MINUTES, TimeUnit.HOURS]}
                                error={Boolean(formErrors.slowModeUnit)}
                                errorText={formErrors.slowModeUnit && l(formErrors.slowModeUnit)}
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
                        onClick={() => submitForm()}
                        disabled={pending || avatarUploadPending || checkingSlugAvailability}
                >
                    {pending && <CircularProgress size={25} color="primary"/>}
                    {l("chat.update.save-changes")}
                </Button>
            </DialogActions>
            <MarkdownPreviewDialog text={formValues.description || ""}/>
        </Dialog>
    );
});
