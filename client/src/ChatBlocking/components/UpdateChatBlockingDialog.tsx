import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {DateTimePicker} from "@mui/x-date-pickers";
import randomColor from "randomcolor";
import {HttpStatusCode} from "axios";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {Avatar} from "../../Avatar";
import {TranslationFunction} from "../../localization";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useLuminosity, useMobileDialog} from "../../utils/hooks";

const useStyles = makeStyles()(() => ({
    blockedUserContainer: {
        display: "flex"
    }
}));

const getErrorLabel = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === API_UNREACHABLE_STATUS) {
        return l("chat.blocking.update.error.server-unreachable");
    } else if (apiError.status === HttpStatusCode.Forbidden) {
        return l("chat.blocking.update.error.forbidden");
    } else {
        return l("chat.blocking.update.error.unknown", {responseStatus: apiError.status})
    }
};

export const UpdateChatBlockingDialog: FunctionComponent = observer(() => {
    const {
        updateChatBlocking: {
            updateChatBlockingForm: formData,
            formErrors,
            pending,
            submissionError,
            updateChatBlockingDialogOpen,
            updatedChatBlocking,
            setUpdateChatBlockingDialogOpen,
            setFormValue,
            updateChatBlocking
        }
    } = useStore();
    const {l} = useLocalization();
    const {classes} = useStyles();
    const theme = useTheme();
    const {fullScreen} = useMobileDialog();
    const luminosity = useLuminosity();

    const chat = useEntityById("chats", updatedChatBlocking?.chatId);
    const blockedUser = useEntityById("users", updatedChatBlocking?.blockedUserId);

    if (!chat || !blockedUser) {
        return null;
    }

    const username = getUserDisplayedName(blockedUser);
    const avatarLetters = getUserAvatarLabel(blockedUser);
    const color = randomColor({seed: blockedUser.id, luminosity});

    return (
        <Dialog open={updateChatBlockingDialogOpen}
                onClose={() => setUpdateChatBlockingDialogOpen(false)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="lg"
        >
            <DialogTitle>
                {l(
                    "chat.blocking.update",
                    {
                        username,
                        chatName: chat.name
                    }
                )}
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
                        {username}
                    </Typography>
                </div>
                <DateTimePicker value={formData.blockedUntil}
                                onChange={date => setFormValue("blockedUntil", date ? date : undefined)}
                                disablePast
                                format="dd MMMM yyyy HH:mm"
                                ampm={false}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        margin: "dense",
                                        error: Boolean(formErrors.blockedUntil),
                                        helperText: formErrors.blockedUntil && l(formErrors.blockedUntil),
                                    }
                                }}
                />
                <TextField label={l("chat.blocking.description")}
                           value={formData.description}
                           onChange={event => setFormValue("description", event.target.value)}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.description)}
                           helperText={formErrors.description && l(formErrors.description)}
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
                        onClick={() => setUpdateChatBlockingDialogOpen(false)}
                >
                    {l("close")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        disabled={pending}
                        onClick={updateChatBlocking}
                >
                    {pending && <CircularProgress size={25} color="primary"/>}
                    {l("chat.blocking.update.blocking")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
