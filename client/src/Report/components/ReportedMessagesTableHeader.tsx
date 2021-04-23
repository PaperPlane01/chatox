import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableHead, TableRow, TableCell} from "@material-ui/core";
import {useLocalization} from "../../store/hooks";

export const ReportedMessagesTableHead: FunctionComponent = observer(() => {
    const {l} = useLocalization();

    return (
        <TableHead>
            <TableRow>
                <TableCell/>
                <TableCell>{l("report.reason")}</TableCell>
                <TableCell>{l("report.status")}</TableCell>
                <TableCell>{l("report.created-at")}</TableCell>
                <TableCell>{l("report.taken-actions")}</TableCell>
            </TableRow>
        </TableHead>
    );
});
