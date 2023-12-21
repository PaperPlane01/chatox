import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {CircularProgress, Dialog, DialogContent, DialogTitle, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Remove} from "@mui/icons-material";
import {format} from "date-fns";
import {getChatInviteLink} from "../utils";
import {JoinChatAllowanceInfo} from "../../JoinChatAllowanceForm";
import {useEntities, useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {CopyToClipboardButton} from "../../CopyToClipboardButton";
import {UserLink} from "../../UserLink";
import {isDefined} from "../../utils/object-utils";
import {commonStyles} from "../../style";

const useStyles = makeStyles(() => createStyles({
    centered: commonStyles.centered
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
    const {l} = useLocalization();
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
                <Typography variant="h6">
                    {l("chat.invite.created-at")}
                </Typography>
                <Typography>
                    {format(chatInvite.createdAt, "dd MMMM yyyy HH:mm")}
                </Typography>
                <Typography variant="h6">
                    {l("chat.invite.created-by")}
                </Typography>
                <Typography>
                    <UserLink user={createdBy} displayAvatar/>
                </Typography>
                <JoinChatAllowanceInfo allowances={chatInvite.joinAllowanceSettings}
                                       wrapWithBorder
                                       label="chat.invite.usage-allowance"
                />
                <Typography variant="h6">
                    {l("chat.invite.use-times")}
                </Typography>
                <Typography>
                    {chatInvite.useTimes}
                </Typography>
                <Typography variant="h6">
                    {l("chat.invite.max-use-times")}
                </Typography>
                <Typography>
                    {isDefined(chatInvite.maxUseTimes) ? chatInvite.maxUseTimes : <Remove/>}
                </Typography>
                <Typography variant="h6">
                    {l("chat.invite.user")}
                </Typography>
                <Typography>
                    {user
                        ? <UserLink user={user} displayAvatar/>
                        : <Remove/>
                    }
                </Typography>
                <Typography variant="h6">
                    {l("chat.invite.last-used-at")}
                </Typography>
                <Typography>
                    {isDefined(chatInvite.lastUsedAt)
                        ? format(chatInvite.lastUsedAt, "dd MMMM yyyy HH:mm")
                        : <Remove/>
                    }
                </Typography>
                <Typography variant="h6">
                    {l("chat.invite.last-used-by")}
                </Typography>
                <Typography>
                    {lastUsedBy
                        ? <UserLink user={lastUsedBy} displayAvatar/>
                        : <Remove/>
                    }
                </Typography>
                <Typography variant="h6">
                    {l("chat.invite.updated-at")}
                </Typography>
                <Typography>
                    {isDefined(chatInvite.updatedAt)
                        ? format(chatInvite.updatedAt, "dd MMMM yyyy HH:mm")
                        : <Remove/>
                    }
                </Typography>
                <Typography variant="h6">
                    {l("chat.invite.updated-by")}
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
        </Dialog>
    );
});
