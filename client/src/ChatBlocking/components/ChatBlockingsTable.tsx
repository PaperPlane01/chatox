import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@material-ui/core";
import {ChatBlockingsTableRow} from "./ChatBlockingsTableRow";
import {ChatBlockingsOfChatState, FindChatBlockingsByChatOptions} from "../stores";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";
import {toJS} from "mobx";

interface ChatBlockingsTableMobxProps {
    selectedChatId: string | undefined,
    getChatBlockingsOfChatState: (chatId: string) => ChatBlockingsOfChatState,
    getChatBlockingsOfChat: (options: FindChatBlockingsByChatOptions) => string[],
}

type ChatBlockingsTableProps = ChatBlockingsTableMobxProps & Localized;

const _ChatBlockingsTable: FunctionComponent<ChatBlockingsTableProps> = ({
    selectedChatId,
    getChatBlockingsOfChatState,
    getChatBlockingsOfChat,
    l,
}) => {
    if (!selectedChatId || !getChatBlockingsOfChatState(selectedChatId)) {
        return null;
    }

    const chatBlockingsState = getChatBlockingsOfChatState(selectedChatId);

    if (chatBlockingsState.pagination.pending && !chatBlockingsState.pagination.initiallyFetched) {
        return <CircularProgress size={25} color="primary"/>
    }

    const chatBlockings = getChatBlockingsOfChat({
        chatId: selectedChatId,
        sortingDirection: chatBlockingsState.pagination.sortingDirection,
        sortingProperty: chatBlockingsState.pagination.sortBy
    });

    console.log(toJS(chatBlockings));

    if (chatBlockingsState.pagination.initiallyFetched && chatBlockings.length === 0) {
        if (chatBlockingsState.showActiveOnly) {
            return (
                <Typography>
                    {l("chat.blocking.no-active-blockings")}
                </Typography>
            );
        } else {
            return (
                <Typography>
                    {l("chat.blocking.no-blockings")}
                </Typography>
            )
        }
    }

    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>{l("chat.blocking.blocked-user")}</TableCell>
                    <TableCell>{l("chat.blocking.created-at")}</TableCell>
                    <TableCell>{l("chat.blocking.blocked-until")}</TableCell>
                    <TableCell>{l("chat.blocking.description")}</TableCell>
                    <TableCell>{l("chat.blocking.blocked-by")}</TableCell>
                    <TableCell>{l("chat.blocking.canceled-at")}</TableCell>
                    <TableCell>{l("chat.blocking.canceled-by")}</TableCell>
                    <TableCell>{l("chat.blocking.updated-at")}</TableCell>
                    <TableCell>{l("chat.blocking.updated-by")}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {chatBlockings.map(chatBlockingId => (
                    <ChatBlockingsTableRow chatBlockingId={chatBlockingId}
                                           key={chatBlockingId}
                    />
                ))}
            </TableBody>
        </Table>
    )
 };

const mapMobxToProps: MapMobxToProps<ChatBlockingsTableMobxProps> = ({
    chat,
    chatBlockingsOfChat,
    entities
}) => ({
    selectedChatId: chat.selectedChatId,
    getChatBlockingsOfChatState: chatBlockingsOfChat.getChatBlockingsOfChatState,
    getChatBlockingsOfChat: entities.chatBlockings.findByChat,
});

export const ChatBlockingsTable = localized(
    inject(mapMobxToProps)(observer(_ChatBlockingsTable))
) as FunctionComponent;
