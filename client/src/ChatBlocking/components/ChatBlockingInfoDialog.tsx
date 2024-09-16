import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
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
} from "@mui/material";
import {format} from "date-fns";
import {CancelChatBlockingButton} from "./CancelChatBlockingButton";
import {UserLink} from "../../UserLink";
import {isStringEmpty} from "../../utils/string-utils";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";

export const ChatBlockingInfoDialog: FunctionComponent = observer(() => {
    const {
        chatBlockingInfoDialog: {
            chatBlockingDialogOpen,
            setChatBlockingDialogOpen,
            chatBlockingId
        }
    } = useStore();
    const {l, dateFnsLocale} = useLocalization();

    const chatBlocking = useEntityById("chatBlockings", chatBlockingId);
    const chat = useEntityById("chats", chatBlocking?.chatId);
    const blockedUser = useEntityById("users", chatBlocking?.blockedUserId);
    const blockedBy = useEntityById("users", chatBlocking?.blockedById);
    const canceledBy = useEntityById("users", chatBlocking?.canceledByUserId);
    const updatedBy = useEntityById("users", chatBlocking?.lastModifiedByUserId);

    if (!chatBlockingId || !chatBlocking || !chat || !blockedUser || !blockedBy) {
        return null;
    }

    return (
        <Dialog open={chatBlockingDialogOpen}
                fullScreen
                onClose={() => setChatBlockingDialogOpen(false)}
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
                        onClick={() => setChatBlockingDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
