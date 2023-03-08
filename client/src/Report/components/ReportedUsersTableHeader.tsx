import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableHead, TableRow, TableCell} from "@mui/material";
import {useLocalization} from "../../store";

export const ReportedUsersTableHeader: FunctionComponent = observer(() => {
    const {l} = useLocalization();

    return (
        <TableHead>
            <TableRow>
                <TableCell/>
                <TableCell>{l("report.reason")}</TableCell>
                <TableCell>{l("report.description")}</TableCell>
                <TableCell>{l("report.status")}</TableCell>
                <TableCell>{l("report.created-at")}</TableCell>
                <TableCell>{l("report.taken-actions")}</TableCell>
                <TableCell>{l("report.user.reported-user")}</TableCell>
            </TableRow>
        </TableHead>
    );
});
