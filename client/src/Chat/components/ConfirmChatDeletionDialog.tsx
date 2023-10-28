import React, {FunctionComponent, ReactNode, useEffect} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Theme,
    Typography,
} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {useSnackbar} from "notistack";
import {getChatDeletionErrorText} from "../utils";
import {useLocalization, useStore} from "../../store";
import {Language} from "../../localization";
import {ChatDeletionStep} from "../types";
import {useMobileDialog} from "../../utils/hooks";

type ChatDeletionWarningMap = {
    [key in Language]: ReactNode
}

const chatDeletionWarningMap: ChatDeletionWarningMap = {
    en: (
        <Typography>
            Chat deletion is one-way operation. <b>It cannot be undone.</b>
        </Typography>
    ),
    ru: (
        <Typography>
            Удаление чата — это необратимое действие. <b>Оно не может быть отменено.</b>
        </Typography>
    )
};

const useStyles = makeStyles((theme: Theme) => createStyles({
    deleteButton: {
        backgroundColor: theme.palette.error.dark,
        color: theme.palette.getContrastText(theme.palette.error.dark)
    }
}));

export const ConfirmChatDeletionDialog: FunctionComponent = observer(() => {
    const {
        chatDeletion: {
            deletionReasonRequired,
            deleteChat,
            pending,
            error,
            currentStep,
            setCurrentStep,
            selectedChat,
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l, locale} = useLocalization();
    const {fullScreen} = useMobileDialog();
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                enqueueSnackbar(l("chat.delete.success"));
                setShowSnackbar(false);
            }
        },
        [showSnackbar]
    );

    const handleDeleteClick = (): void => {
        if (deletionReasonRequired) {
            setCurrentStep(ChatDeletionStep.SPECIFY_DELETION_REASON);
        } else {
            deleteChat();
        }
    }

    if (!selectedChat) {
        return null;
    }

    return  (
        <Dialog open={currentStep === ChatDeletionStep.CONFIRM_CHAT_DELETION}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
                onClose={() => setCurrentStep(ChatDeletionStep.NONE)}
        >
            <DialogTitle>
                {l("chat.delete.with-name", {chatName: selectedChat.name})}
            </DialogTitle>
            <DialogContent>
                {chatDeletionWarningMap[locale]}
                {error && (
                    <Typography style={{color: "red"}}>
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
                        onClick={handleDeleteClick}
                        className={classes.deleteButton}
                        disabled={pending}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("common.delete")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});