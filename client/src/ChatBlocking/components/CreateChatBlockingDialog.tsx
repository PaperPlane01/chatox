import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Theme,
    Typography,
    useTheme
} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {DateTimePicker} from "@mui/x-date-pickers";
import randomColor from "randomcolor";
import {RecentMessagesDeletionPeriod} from "../types";
import {Labels, TranslationFunction} from "../../localization";
import {Avatar} from "../../Avatar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useMobileDialog} from "../../utils/hooks";

const useStyles = makeStyles((theme: Theme) => createStyles({
    blockedUserContainer: {
        display: "flex"
    },
    withPaddingTop: {
        paddingTop: theme.spacing(1)
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

const getMessagesDeletionPeriodLabelCode = (messagesDeletionPeriod: RecentMessagesDeletionPeriod): keyof Labels => {
    return `chat.blocking.messages-deletion-period.${messagesDeletionPeriod}` as keyof Labels;
};

export const CreateChatBlockingDialog: FunctionComponent = observer(() => {
    const {
        createChatBlocking: {
            createChatBlockingFormData: formData,
            formErrors: errors,
            chatId,
            createChatBlockingDialogOpen: open,
            submissionError,
            pending,
            setFormValue,
            setCreateChatBlockingDialogOpen,
            createChatBlocking
        }
    } = useStore();
    const {l} = useLocalization();
    const theme = useTheme();
    const classes = useStyles();
    const {fullScreen} = useMobileDialog();
    const chat = useEntityById("chats", chatId);
    const user = useEntityById("users", formData.blockedUserId);

    if (!chat || !user) {
        return null;
    }

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
                            avatarId={user.avatarId}
                            width={25}
                            height={25}
                    />
                    <Typography style={{color}}>
                        {user.firstName} {user.lastName && user.lastName}
                    </Typography>
                </div>
                <DateTimePicker value={formData.blockedUntil}
                                onChange={date => setFormValue("blockedUntil", date ? date : undefined)}
                                disablePast
                                inputFormat="dd MMMM yyyy HH:mm"
                                ampm={false}
                                renderInput={props => (
                                    <TextField {...props}
                                               fullWidth
                                               label={l("chat.blocking.blocked-until")}
                                    />
                                )}
                                showToolbar
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
                <FormControlLabel label={l("chat.blocking.delete-recent-messages")}
                                  control={
                                      <Switch checked={formData.deleteRecentMessages}
                                              onChange={event => setFormValue("deleteRecentMessages", event.target.checked)}
                                              color="primary"
                                      />
                                  }
                />
                {formData.deleteRecentMessages && (
                    <FormControl fullWidth
                                 className={classes.withPaddingTop}
                    >
                        <InputLabel>{l("chat.blocking.messages-deletion-period")}</InputLabel>
                        <Select value={formData.recentMessagesDeletionPeriod}
                                onChange={event => setFormValue(
                                    "recentMessagesDeletionPeriod",
                                    event.target.value as RecentMessagesDeletionPeriod
                                )}
                        >
                            <MenuItem value={RecentMessagesDeletionPeriod.FIVE_MINUTES}>
                                {l(getMessagesDeletionPeriodLabelCode(RecentMessagesDeletionPeriod.FIVE_MINUTES))}
                            </MenuItem>
                            <MenuItem value={RecentMessagesDeletionPeriod.ONE_HOUR}>
                                {l(getMessagesDeletionPeriodLabelCode(RecentMessagesDeletionPeriod.ONE_HOUR))}
                            </MenuItem>
                            <MenuItem value={RecentMessagesDeletionPeriod.ONE_DAY}>
                                {l(getMessagesDeletionPeriodLabelCode(RecentMessagesDeletionPeriod.ONE_DAY))}
                            </MenuItem>
                            <MenuItem value={RecentMessagesDeletionPeriod.ALL_TIME}>
                                {l(getMessagesDeletionPeriodLabelCode(RecentMessagesDeletionPeriod.ALL_TIME))}
                            </MenuItem>
                        </Select>
                    </FormControl>
                )}
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
    );
});
