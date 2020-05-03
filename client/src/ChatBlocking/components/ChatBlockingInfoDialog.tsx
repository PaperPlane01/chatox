import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from "@material-ui/core";
import {format} from "date-fns";
import {CancelChatBlockingButton} from "./CancelChatBlockingButton";
import {ChatBlockingEntity} from "../types";
import {localized, Localized} from "../../localization/components";
import {UserEntity} from "../../User/types";
import {ChatOfCurrentUserEntity} from "../../Chat/types";
import {UserLink} from "../../UserLink";
import {isStringEmpty} from "../../utils/string-utils";
import {MapMobxToProps} from "../../store";

interface ChatBlockingInfoDialogMobxProps {
    chatBlockingId: string | undefined,
    chatBlockingInfoDialogOpen: boolean,
    setChatBlockingInfoDialogOpen: (chatBlockingInfoDialogOpen: boolean) => void,
    findChatBlocking: (chatBlockingId: string) => ChatBlockingEntity,
    findChat: (chatId: string) => ChatOfCurrentUserEntity,
    findUser: (userId: string) => UserEntity,
}

type ChatBlockingInfoDialogProps = ChatBlockingInfoDialogMobxProps & Localized;

const _ChatBlockingInfoDialog: FunctionComponent<ChatBlockingInfoDialogProps> = ({
    chatBlockingId,
    chatBlockingInfoDialogOpen,
    setChatBlockingInfoDialogOpen,
    findUser,
    findChatBlocking,
    findChat,
    l,
    dateFnsLocale
}) => {
    if (!chatBlockingId) {
        return null;
    }

    const chatBlocking = findChatBlocking(chatBlockingId);
    const chat = findChat(chatBlocking.chatId);
    const blockedUser = findUser(chatBlocking.blockedUserId);
    const blockedBy = findUser(chatBlocking.blockedById);
    const canceledBy = chatBlocking.canceledByUserId ? findUser(chatBlocking.canceledByUserId) : undefined;
    const updatedBy = chatBlocking.lastModifiedByUserId ? findUser(chatBlocking.lastModifiedByUserId) : undefined;

    return (
        <Dialog open={chatBlockingInfoDialogOpen}
                fullScreen
                onClose={() => setChatBlockingInfoDialogOpen(false)}
        >
            <DialogTitle>
                {l("chat.blocking.info", {
                    username: `${blockedUser.firstName}${blockedUser.lastName ? " " + blockedUser.lastName : ""}`,
                    chatName: chat.name
                })}
            </DialogTitle>
            <DialogContent>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>{l("chat.blocking.blocked-user")}</TableCell>
                            <TableCell>
                                <UserLink user={blockedUser} displayAvatar/>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{l("chat.blocking.created-at")}</TableCell>
                            <TableCell>
                                {format(chatBlocking.createdAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{l("chat.blocking.blocked-until")}</TableCell>
                            <TableCell>
                                {format(chatBlocking.blockedUntil, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{l("chat.blocking.description")}</TableCell>
                            <TableCell>
                                {isStringEmpty(chatBlocking.description) ? "—" : chatBlocking.description}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{l("chat.blocking.blocked-by")}</TableCell>
                            <TableCell>
                                <UserLink user={blockedBy} displayAvatar/>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{l("chat.blocking.canceled-at")}</TableCell>
                            <TableCell>
                                {chatBlocking.canceledAt
                                    ? format(chatBlocking.canceledAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                                    : "—"
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{l("chat.blocking.canceled-by")}</TableCell>
                            <TableCell>
                                {canceledBy
                                    ? <UserLink user={canceledBy} displayAvatar/>
                                    : "—"
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{l("chat.blocking.updated-at")}</TableCell>
                            <TableCell>
                                {chatBlocking.lastModifiedAt
                                    ? format(chatBlocking.lastModifiedAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                                    : "—"
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{l("chat.blocking.updated-by")}</TableCell>
                            <TableCell>
                                {updatedBy
                                    ? <UserLink user={updatedBy} displayAvatar/>
                                    : "—"
                                }
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography>{l("chat.blocking.actions")}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <CancelChatBlockingButton chatBlockingId={chatBlockingId}/>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setChatBlockingInfoDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingInfoDialogMobxProps> = ({
    chatBlockingInfoDialog,
    entities
}) => ({
    chatBlockingId: chatBlockingInfoDialog.chatBlockingId,
    chatBlockingInfoDialogOpen: chatBlockingInfoDialog.chatBlockingDialogOpen,
    setChatBlockingInfoDialogOpen: chatBlockingInfoDialog.setChatBlockingDialogOpen,
    findUser: entities.users.findById,
    findChat: entities.chats.findById,
    findChatBlocking: entities.chatBlockings.findById
});

export const ChatBlockingInfoDialog = localized(
    inject(mapMobxToProps)(observer(_ChatBlockingInfoDialog))
) as FunctionComponent;
