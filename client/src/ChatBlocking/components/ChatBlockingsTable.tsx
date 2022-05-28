import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography
} from "@mui/material";
import {ChatBlockingsTableRow} from "./ChatBlockingsTableRow";
import {ChatBlockingSortableProperties} from "../types";
import {useLocalization, useStore} from "../../store";
import {getOppositeSortingDirection} from "../../utils/types";

export const ChatBlockingsTable: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        chatBlockingsOfChat: {
            getChatBlockingsOfChatState,
            setSortingDirectionAndProperty
        },
        entities: {
            chatBlockings: {
                findByChat: getChatBlockingsOfChat
            }
        }
    } = useStore();
    const {l} = useLocalization();

    if (!selectedChatId || !getChatBlockingsOfChatState(selectedChatId)) {
        return null;
    }

    const chatBlockingsState = getChatBlockingsOfChatState(selectedChatId);

    if (chatBlockingsState.pagination.pending && !chatBlockingsState.pagination.initiallyFetched) {
        return <CircularProgress size={25} color="primary"/>
    }

    const currentDirection = chatBlockingsState.pagination.sortingDirection;
    const currentProperty = chatBlockingsState.pagination.sortBy;

    const handleSortingPropertyChange = (sortingProperty: ChatBlockingSortableProperties): void => {
        if (currentProperty === sortingProperty) {
            setSortingDirectionAndProperty(getOppositeSortingDirection(currentDirection), sortingProperty);
        } else {
            setSortingDirectionAndProperty(currentDirection, sortingProperty);
        }
    };

    const chatBlockings = getChatBlockingsOfChat({
        chatId: selectedChatId,
        sortingDirection: chatBlockingsState.pagination.sortingDirection,
        sortingProperty: chatBlockingsState.pagination.sortBy,
        filter: chatBlockingsState.filter
    });

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
        <Table size="small"
               stickyHeader
        >
            <TableHead>
                <TableRow>
                    <TableCell>{l("chat.blocking.blocked-user")}</TableCell>
                    <TableCell sortDirection={currentDirection}>
                        <TableSortLabel direction={currentDirection}
                                        onClick={() => handleSortingPropertyChange("createdAt")}
                                        active={currentProperty === "createdAt"}
                        >
                            {l("chat.blocking.created-at")}
                        </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={currentDirection}>
                        <TableSortLabel direction={currentDirection}
                                        onClick={() => handleSortingPropertyChange("blockedUntil")}
                                        active={currentProperty === "blockedUntil"}
                        >
                            {l("chat.blocking.blocked-until")}
                        </TableSortLabel>
                    </TableCell>
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
    );
 });
