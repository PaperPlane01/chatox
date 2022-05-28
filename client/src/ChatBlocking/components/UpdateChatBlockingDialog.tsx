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
    useTheme,
} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {DateTimePicker} from "@mui/x-date-pickers";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import randomColor from "randomcolor";
import {getUserAvatarLabel} from "../../User/utils/labels";
import {Avatar} from "../../Avatar";
import {TranslationFunction} from "../../localization";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

const useStyles = makeStyles(() => createStyles({
    blockedUserContainer: {
        display: "flex"
    }
}));

const getErrorLabel = (apiError: ApiError, l: TranslationFunction): string => {
    if (apiError.status === API_UNREACHABLE_STATUS) {
        return l("chat.blocking.update.error.server-unreachable");
    } else if (apiError.status === 403) {
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
        },
        entities: {
            chats: {
                findById: findChat
            },
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const {fullScreen} = useMobileDialog();

    if (!updatedChatBlocking) {
        return null;
    }

    const chat = findChat(updatedChatBlocking.chatId);
    const blockedUser = findUser(updatedChatBlocking.blockedUserId);
    const username = `${blockedUser.firstName} ${blockedUser.lastName ? blockedUser.lastName : ""}`;
    const avatarLetters = getUserAvatarLabel(blockedUser);
    const color = randomColor({seed: blockedUser.id});

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
                        {blockedUser.firstName} {blockedUser.lastName && blockedUser.lastName}
                    </Typography>
                </div>
                <DateTimePicker value={formData.blockedUntil}
                                onChange={date => setFormValue("blockedUntil", date ? date : undefined)}
                                disablePast
                                inputFormat="dd MMMM yyyy HH:mm"
                                ampm={false}
                                renderInput={props => (
                                    <TextField {...props}
                                               label={l("chat.blocking.blocked-until")}
                                               error={Boolean(formErrors.blockedUntil)}
                                               helperText={formErrors.blockedUntil && l(formErrors.blockedUntil)}
                                               fullWidth
                                               margin="dense"
                                    />
                                )}
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
