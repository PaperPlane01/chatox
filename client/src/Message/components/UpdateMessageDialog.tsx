import React, {Fragment, FunctionComponent, ReactNode} from "react";
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
import {MarkdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {Language, localized, Localized, TranslationFunction} from "../../localization";
import {UpdateMessageFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {MapMobxToProps} from "../../store";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";

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

const forbiddenErrorTranslations = {
    en: (
        <Fragment>
            Could not update message, server responded with 403 error status.
            This may have happened due to the following reasons:
            <ul>
                <li>
                    Message has been published more than 24 hours ago
                </li>
                <li>
                    Message has been deleted
                </li>
                <li>
                    Yoy were blocked in the chat
                </li>
                <li>
                    You are no longer participant of this chat
                </li>
            </ul>
        </Fragment>
    ),
    ru: (
        <Fragment>
            Во время попытки обновить сообщение произошла ошибка, сервер ответил со статусом 404.
            Это могло произойти по следующим причинам:
            <ul>
                <li>
                    Сообщение было создано более 24 часов назад
                </li>
                <li>
                    Сообщение было удалено
                </li>
                <li>
                    Вы были заблокированы в чате
                </li>
                <li>
                    Вы более не являетесь участником чата
                </li>
            </ul>
        </Fragment>
    )
};

const getErrorText = (apiError: ApiError, l: TranslationFunction, currentLanguage: Language): ReactNode => {
    let errorContent: ReactNode;
    switch (apiError.status) {
        case API_UNREACHABLE_STATUS:
            errorContent = l("message.edit.error.server-unreachable");
            break;
        case 403:
            errorContent = forbiddenErrorTranslations[currentLanguage];
            break;
        default:
            errorContent = l("message.edit.error.unknown", {errorStatus: apiError.status});
            break;
    }

    return (
        <Typography style={{color: "red"}}>
            {errorContent}
        </Typography>
    );
};

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
    l,
    locale
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
                {error && getErrorText(error, l, locale)}
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
            <MarkdownPreviewDialog text={updateMessageForm.text}/>
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
