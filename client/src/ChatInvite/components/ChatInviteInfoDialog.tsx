import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Theme,
    Typography
} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ArrowBack, Remove} from "@mui/icons-material";
import {format} from "date-fns";
import {getChatInviteLink} from "../utils";
import {JoinChatAllowanceInfo} from "../../JoinChatAllowanceForm";
import {useEntities, useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {CopyToClipboardButton} from "../../CopyToClipboardButton";
import {UserLink} from "../../UserLink";
import {isDefined} from "../../utils/object-utils";
import {commonStyles} from "../../style";

const useStyles = makeStyles((theme: Theme) => createStyles({
    centered: commonStyles.centered,
    withPaddingBottom: {
        paddingBottom: theme.spacing(2)
    },
    withPaddingTop: {
        paddingTop: theme.spacing(2)
    }
}));

export const ChatInviteInfoDialog: FunctionComponent = observer(() => {
    const {
        chatInviteDialog: {
            inviteId,
            pending,
            error,
            open,
            closeDialog
        }
    } = useStore();
    const {
        chatInvites: {
            findById: findChatInvite
        },
        users: {
            findById: findUser
        }
    } = useEntities();
    const {l, dateFnsLocale} = useLocalization();
    const {fullScreen} = useMobileDialog();
    const classes = useStyles();

    if (!inviteId) {
        return null;
    }

    const chatInvite = findChatInvite(inviteId);

    const createdBy = findUser(chatInvite.createdById);
    const user = chatInvite.userId && findUser(chatInvite.userId);
    const updatedBy = chatInvite.updatedById && findUser(chatInvite.updatedById);
    const lastUsedBy = chatInvite.lastUsedById && findUser(chatInvite.lastUsedById);
    const link = getChatInviteLink(chatInvite.id);

    let content: ReactNode;

    if (pending) {
        content = <CircularProgress size={25} color="primary" className={classes.centered}/>;
    } else {
        content = (
            <Fragment>
                {error && (
                    <Typography color="red">
                        {l("chat.invite.error.refresh")}
                    </Typography>
                )}
                <Typography>
                    <strong>{l("chat.invite.created-at")}</strong>
                </Typography>
                <Typography>
                    {format(chatInvite.createdAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
                </Typography>
                <Typography>
                    <strong>{l("chat.invite.created-by")}</strong>
                </Typography>
                <Typography className={classes.withPaddingBottom}>
                    <UserLink user={createdBy} displayAvatar/>
                </Typography>
                <JoinChatAllowanceInfo allowances={chatInvite.joinAllowanceSettings}
                                       wrapWithBorder
                                       label="chat.invite.usage-allowance"
                />
                <Typography className={classes.withPaddingTop}>
                    <strong>{l("chat.invite.use-times")}</strong>
                </Typography>
                <Typography>
                    {chatInvite.useTimes}
                </Typography>
                <Typography>
                    <strong>{l("chat.invite.max-use-times")}</strong>
                </Typography>
                <Typography>
                    {isDefined(chatInvite.maxUseTimes) ? chatInvite.maxUseTimes : <Remove/>}
                </Typography>
                <Typography>
                    <strong>{l("chat.invite.user")}</strong>
                </Typography>
                <Typography>
                    {user
                        ? <UserLink user={user} displayAvatar/>
                        : <Remove/>
                    }
                </Typography>
                <Typography>
                    <strong>{l("chat.invite.last-used-at")}</strong>
                </Typography>
                <Typography>
                    {isDefined(chatInvite.lastUsedAt)
                        ? format(chatInvite.lastUsedAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                        : <Remove/>
                    }
                </Typography>
                <Typography>
                    <strong>{l("chat.invite.last-used-by")}</strong>
                </Typography>
                <Typography>
                    {lastUsedBy
                        ? <UserLink user={lastUsedBy} displayAvatar/>
                        : <Remove/>
                    }
                </Typography>
                <Typography>
                    <strong>{l("chat.invite.updated-at")}</strong>
                </Typography>
                <Typography>
                    {isDefined(chatInvite.updatedAt)
                        ? format(chatInvite.updatedAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                        : <Remove/>
                    }
                </Typography>
                <Typography>
                    <strong>{l("chat.invite.updated-by")}</strong>
                </Typography>
                <Typography>
                    {updatedBy
                        ? <UserLink user={updatedBy} displayAvatar/>
                        : <Remove/>
                    }
                </Typography>
            </Fragment>
        );
    }

    return (
        <Dialog open={open}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
                onClose={closeDialog}
        >
            <DialogTitle>
                <IconButton onClick={closeDialog}>
                    <ArrowBack/>
                </IconButton>
                {l("chat.invite.with-name", {name: chatInvite.name ?? link})}
                <div style={{float: "right"}}>
                    <CopyToClipboardButton content={link}
                                           successLabel="chat.invite.copy.success"
                    />
                </div>
            </DialogTitle>
            <DialogContent>
                {content}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={closeDialog}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
