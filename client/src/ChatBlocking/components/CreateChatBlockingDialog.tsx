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
import {DateTimePicker} from "@mui/x-date-pickers";
import {makeStyles} from "tss-react/mui";
import randomColor from "randomcolor";
import {HttpStatusCode} from "axios";
import {RecentMessagesDeletionPeriod} from "../types";
import {Labels, TranslationFunction} from "../../localization";
import {Avatar} from "../../Avatar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useLuminosity, useMobileDialog} from "../../utils/hooks";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";

const useStyles = makeStyles()((theme: Theme) => ({
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
    } else if (apiError.status === HttpStatusCode.Forbidden) {
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
    const {classes} = useStyles();
    const {fullScreen} = useMobileDialog();
    const chat = useEntityById("chats", chatId);
    const user = useEntityById("users", formData.blockedUserId);
    const luminosity = useLuminosity();

    if (!chat || !user) {
        return null;
    }

    const userName = getUserDisplayedName(user);
    const avatarLetters = getUserAvatarLabel(user);
    const color = randomColor({seed: user.id, luminosity});

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
                        {userName}
                    </Typography>
                </div>
                <DateTimePicker value={formData.blockedUntil}
                                onChange={date => setFormValue("blockedUntil", date ? date : undefined)}
                                disablePast
                                format="dd MMM yyyy HH:mm"
                                ampm={false}
                                label={l("chat.blocking.blocked-until")}
                                slotProps={{
                                    textField: {
                                        fullWidth: true
                                    }
                                }}
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
