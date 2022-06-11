import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableCell, TableRow} from "@mui/material";
import {format} from "date-fns";
import {CancelChatBlockingButton} from "./CancelChatBlockingButton";
import {UpdateChatBlockingButton} from "./UpdateChatBlockingButton";
import {isChatBlockingActive} from "../utils";
import {UserLink} from "../../UserLink";
import {useLocalization, useStore} from "../../store";

interface ChatBlockingsTableRowProps {
    chatBlockingId: string
}

export const ChatBlockingsTableRow: FunctionComponent<ChatBlockingsTableRowProps> = observer(({chatBlockingId}) => {
    const {
        entities: {
            chatBlockings: {
                findById: findChatBlocking
            },
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const {dateFnsLocale} = useLocalization();
    const chatBlocking = findChatBlocking(chatBlockingId);
    const blockedUser = findUser(chatBlocking.blockedUserId);
    const blockedBy = findUser(chatBlocking.blockedById);
    const canceledBy = chatBlocking.canceledByUserId ? findUser(chatBlocking.canceledByUserId) : undefined;
    const updatedBy = chatBlocking.lastModifiedByUserId ? findUser(chatBlocking.lastModifiedByUserId) : undefined;

    return (
        <TableRow>
            <TableCell>
                <UserLink user={blockedUser} displayAvatar/>
            </TableCell>
            <TableCell>
                {format(chatBlocking.createdAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
            </TableCell>
            <TableCell>
                {format(chatBlocking.blockedUntil, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})}
            </TableCell>
            <TableCell>
                {chatBlocking.description ? chatBlocking.description : "—"}
            </TableCell>
            <TableCell>
                <UserLink user={blockedBy} displayAvatar/>
            </TableCell>
            <TableCell>
                {chatBlocking.canceledAt
                    ? format(chatBlocking.canceledAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                    : "—"
                }
            </TableCell>
            <TableCell>
                {canceledBy
                    ? (
                        <UserLink user={canceledBy} displayAvatar/>
                    )
                    : "—"
                }
            </TableCell>
            <TableCell>
                {chatBlocking.lastModifiedAt
                    ? format(chatBlocking.lastModifiedAt, "dd MMMM yyyy HH:mm", {locale: dateFnsLocale})
                    : "—"
                }
            </TableCell>
            <TableCell>
                {updatedBy
                    ? (
                        <UserLink user={updatedBy} displayAvatar/>
                    )
                    : "—"
                }
            </TableCell>
            {isChatBlockingActive(chatBlocking) && (
                <Fragment>
                    <CancelChatBlockingButton chatBlockingId={chatBlocking.id}/>
                    <UpdateChatBlockingButton chatBlockingId={chatBlocking.id}/>
                </Fragment>
            )}
        </TableRow>
    );
});
