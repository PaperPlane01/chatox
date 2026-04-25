import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableCell, TableRow} from "@mui/material";
import {format} from "date-fns";
import {CancelChatBlockingButton} from "./CancelChatBlockingButton";
import {UpdateChatBlockingButton} from "./UpdateChatBlockingButton";
import {isChatBlockingActive} from "../utils";
import {UserLink} from "../../UserLink";
import {useLocalization} from "../../store";
import {useEntityById} from "../../entities";

interface ChatBlockingsTableRowProps {
    chatBlockingId: string
}

export const ChatBlockingsTableRow: FunctionComponent<ChatBlockingsTableRowProps> = observer(({chatBlockingId}) => {
    const {dateFnsLocale} = useLocalization();
    const chatBlocking = useEntityById("chatBlockings", chatBlockingId);
    const blockedUser = useEntityById("users", chatBlocking.blockedUserId);
    const blockedBy = useEntityById("users", chatBlocking.blockedById);
    const canceledBy = useEntityById("users", chatBlocking.canceledByUserId);
    const updatedBy = useEntityById("users", chatBlocking.lastModifiedByUserId);

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
