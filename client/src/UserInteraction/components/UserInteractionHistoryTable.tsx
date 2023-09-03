import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Table, TableBody} from "@mui/material";
import {UserInteractionsHistoryTableRow} from "./UserInteractionsHistoryTableRow";
import {UserInteractionsHistoryTableHeader} from "./UserInteractionsHistoryTableHeader";
import {useStore} from "../../store";

export const UserInteractionHistoryTable: FunctionComponent = observer(() => {
    const {
        userInteractionsHistory: {
            userInteractionsIds
        }
    } = useStore();

    return (
        <Table>
            <UserInteractionsHistoryTableHeader/>
            <TableBody>
                {userInteractionsIds.map(userInteractionId => (
                    <UserInteractionsHistoryTableRow userInteractionId={userInteractionId}/>
                ))}
            </TableBody>
        </Table>
    );
});
