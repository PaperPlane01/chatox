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
} from "@mui/material";
import {MarkdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {Language, TranslationFunction} from "../../localization";
import {useLocalization, useStore} from "../../store";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {useMobileDialog} from "../../utils/hooks";

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

export const UpdateMessageDialog: FunctionComponent = observer(() => {
    const {
        messageUpdate: {
            updatedMessageId,
            formValues,
            formErrors,
            pending,
            error,
            setUpdatedMessageId,
            submitForm,
            setFormValue
        }
    } = useStore();
    const {l, locale} = useLocalization();
    const {fullScreen} = useMobileDialog();

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
                           value={formValues.text}
                           onChange={event => setFormValue("text", event.target.value)}
                           error={Boolean(formErrors.text)}
                           helperText={formErrors.text && l(formErrors.text)}
                           fullWidth
                           margin="dense"
                           multiline
                           rows={4}
                           maxRows={Number.MAX_SAFE_INTEGER}
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
                <Button onClick={submitForm}
                        variant="contained"
                        color="primary"
                        disabled={pending}
                >
                    {pending && <CircularProgress size={20} color="primary"/>}
                    {l("chat.update.save-changes")}
                </Button>
            </DialogActions>
            <MarkdownPreviewDialog text={formValues.text}/>
        </Dialog>
    );
});
