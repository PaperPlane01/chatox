import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableCell, TableHead, TableRow} from "@mui/material";
import {useLocalization} from "../../store";

export const UserInteractionsHistoryTableHeader: FunctionComponent = observer(() => {
    const {l} = useLocalization();

    return (
        <TableHead>
            <TableRow>
                <TableCell>{l("user.interaction.type")}</TableCell>
                <TableCell>{l("user.interaction.user")}</TableCell>
                <TableCell>{l("user.interaction.created-at")}</TableCell>
            </TableRow>
        </TableHead>
    );
});
