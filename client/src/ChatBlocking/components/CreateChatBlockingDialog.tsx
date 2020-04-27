import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
    TextField,
    Typography,
    useTheme,
    withMobileDialog,
    WithMobileDialog
} from "@material-ui/core";
import {DateTimePicker} from "@material-ui/pickers";
import {withSnackbar, WithSnackbarProps} from "notistack";
import randomColor from "randomcolor";
import {CreateChatBlockingFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {UserEntity} from "../../User";
import {ChatOfCurrentUserEntity} from "../../Chat/types";
import {localized, Localized, TranslationFunction} from "../../localization";
import {Avatar} from "../../Avatar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {MapMobxToProps} from "../../store";

interface CreateChatBlockingDialogMobxProps {
    formData: CreateChatBlockingFormData,
    errors: FormErrors<CreateChatBlockingFormData>,
    pending: boolean,
    chatId: string | undefined,
    open: boolean,
    showSnackbar: boolean,
    submissionError?: ApiError,
    setFormValue: <Key extends keyof CreateChatBlockingFormData>(key: Key, value: CreateChatBlockingFormData[Key]) => void,
    createChatBlocking: () => void,
    setCreateChatBlockingDialogOpen: (createChatBlockingDialogOpen: boolean) => void,
    setShowSnackbar: (showSnackbar: boolean) => void,
    findUser: (userId: string) => UserEntity,
    findChat: (chatId: string) => ChatOfCurrentUserEntity,
}

type CreateChatBlockingDialogProps = CreateChatBlockingDialogMobxProps & WithMobileDialog & WithSnackbarProps & Localized;

const useStyles = makeStyles(() => createStyles({
    blockedUserContainer: {
        display: "flex"
    }
}));

const getErrorLabel = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === API_UNREACHABLE_STATUS) {
        return l("chat.blocking.error.server-unreachable");
    } else if (apiError.status === 403) {
        return l("chat.blocking.error.forbidden");
    } else {
        return l("chat.blocking.error.unknown", {responseStatus: apiError.status})
    }
};

const _CreateChatBlockingDialog: FunctionComponent<CreateChatBlockingDialogProps> = ({
    formData,
    errors,
    chatId,
    open,
    showSnackbar,
    pending,
    submissionError,
    setFormValue,
    setCreateChatBlockingDialogOpen,
    setShowSnackbar,
    createChatBlocking,
    findUser,
    findChat,
    l,
    fullScreen,
    enqueueSnackbar
}) => {
    const theme = useTheme();
    const classes = useStyles();

    if (!chatId || !formData.blockedUserId) {
        return null;
    }

    if (showSnackbar) {
        setCreateChatBlockingDialogOpen(false);
        enqueueSnackbar(l("chat.blocking.success"));
        setShowSnackbar(false);
        return null;
    }

    const chat = findChat(chatId);
    const user = findUser(formData.blockedUserId);
    const userName = `${user.firstName} ${user.lastName ? user.lastName : ""}`;
    const avatarLetters = `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`;
    const color = randomColor({seed: user.id});

    return (
        <Dialog open={open}
                fullScreen={fullScreen}
                onClose={() => setCreateChatBlockingDialogOpen(false)}
                fullWidth
                maxWidth="lg"
        >
            <DialogTitle>
                {l("chat.blocking.create", {chatName: chat.name, userName})}
            </DialogTitle>
            <DialogContent>
                <div className={classes.blockedUserContainer}>
                    <Typography style={{
                        marginRight: theme.spacing(1)
                    }}>
                        {l("chat.blocking.block-user")}
                    </Typography>
                    <Avatar avatarLetter={avatarLetters}
                            avatarColor={color}
                            width={25}
                            height={25}
                    />
                    <Typography style={{color}}>
                        {user.firstName} {user.lastName && user.lastName}
                    </Typography>
                </div>
                <DateTimePicker label={l("chat.blocking.blocked-until")}
                                value={formData.blockedUntil}
                                onChange={date => setFormValue("blockedUntil", date ? date : undefined)}
                                disablePast
                                autoOk
                                error={Boolean(errors.blockedUntil)}
                                helperText={errors.blockedUntil && l(errors.blockedUntil)}
                                format="dd MMMM yyyy HH:mm"
                                fullWidth
                                margin="dense"
                                ampm={false}
                />
                <TextField label={l("chat.blocking.description")}
                           value={formData.description}
                           onChange={event => setFormValue("description", event.target.value)}
                           fullWidth
                           margin="dense"
                           error={Boolean(errors.description)}
                           helperText={errors.description && l(errors.description)}
                           multiline
                />
                {submissionError && (
                    <Typography style={{color: theme.palette.error.main}}>
                        {getErrorLabel(submissionError, l)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setCreateChatBlockingDialogOpen(false)}
                >
                    {l("close")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        disabled={pending}
                        onClick={createChatBlocking}
                >
                    {pending && <CircularProgress size={25} color="primary"/>}
                    {l("chat.blocking.block-user")}
                </Button>
            </DialogActions>
        </Dialog>
    )
};

const mapMobxToProps: MapMobxToProps<CreateChatBlockingDialogMobxProps> = ({createChatBlocking, entities}) => ({
    formData: createChatBlocking.createChatBlockingFormData,
    errors: createChatBlocking.formErrors,
    pending: createChatBlocking.pending,
    chatId: createChatBlocking.chatId,
    open: createChatBlocking.createChatBlockingDialogOpen,
    showSnackbar: createChatBlocking.showSnackbar,
    submissionError: createChatBlocking.submissionError,
    setFormValue: createChatBlocking.setFormValue,
    createChatBlocking: createChatBlocking.createChatBlocking,
    setCreateChatBlockingDialogOpen: createChatBlocking.setCreateChatBlockingDialogOpen,
    setShowSnackbar: createChatBlocking.setShowSnackbar,
    findUser: entities.users.findById,
    findChat: entities.chats.findById
});

export const CreateChatBlockingDialog = withMobileDialog()(
    withSnackbar(
        localized(inject(mapMobxToProps)(observer(_CreateChatBlockingDialog)))
    )
) as FunctionComponent;
