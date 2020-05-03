import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {TableCell, TableRow} from "@material-ui/core";
import {format} from "date-fns";
import {CancelChatBlockingButton} from "./CancelChatBlockingButton";
import {ChatBlockingEntity} from "../types";
import {isChatBlockingActive} from "../utils";
import {UserEntity} from "../../User";
import {localized, Localized} from "../../localization";
import {UserLink} from "../../UserLink";
import {MapMobxToProps} from "../../store";

interface ChatBlockingsTableRowMobxProps {
    findChatBlocking: (id: string) => ChatBlockingEntity,
    findUser: (id: string) => UserEntity,
    routerStore?: any
}

interface ChatBlockingsTableRowOwnProps {
    chatBlockingId: string
}

type ChatBlockingsTableRowProps = ChatBlockingsTableRowMobxProps & ChatBlockingsTableRowOwnProps & Localized;

const _ChatBlockingsTableRow: FunctionComponent<ChatBlockingsTableRowProps> = ({
    chatBlockingId,
    findChatBlocking,
    findUser,
    dateFnsLocale,
}) => {
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
                <CancelChatBlockingButton chatBlockingId={chatBlocking.id}/>
            )}
        </TableRow>
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingsTableRowMobxProps> = ({entities, store}) => ({
    findChatBlocking: entities.chatBlockings.findById,
    findUser: entities.users.findById,
    routerStore: store
});

export const ChatBlockingsTableRow = localized(
    inject(mapMobxToProps)(observer(_ChatBlockingsTableRow))
) as FunctionComponent<ChatBlockingsTableRowOwnProps>;
