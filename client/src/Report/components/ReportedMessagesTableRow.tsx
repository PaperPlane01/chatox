import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableRow, TableCell, Typography} from "@material-ui/core";
import {useStore, useLocalization} from "../../store/hooks";
import {Labels} from "../../localization/types";
import {format} from "date-fns";

interface ReportedMessagesTableProps {
    reportId: string
}

export const ReportedMessagesTableRow: FunctionComponent<ReportedMessagesTableProps> = observer(({
    reportId
}) => {
    const {
        entities: {
            reports: {
                findById: findReport
            }
        },
        reportedMessageDialog: {
            setReportId
        }
    } = useStore();
    const {l} = useLocalization();

    const report = findReport(reportId);

    return (
        <TableRow>
            <TableCell>{l(`report.reason.${report.reason}` as keyof Labels)}</TableCell>
            <TableCell>{l(`report.status.${report.status}` as keyof Labels)}</TableCell>
            <TableCell>{format(report.createdAt, "dd-MM-yyyy HH:mm")}</TableCell>
            <TableCell>{report.takenActions.map(takenAction => `${takenAction}; `)}</TableCell>
            <TableCell>
                <Typography style={{
                    cursor: "pointer",
                    textDecoration: "underline"
                }}
                            onClick={() => setReportId(reportId)}
                >
                    {l("report.list.messages.show-message")}
                </Typography>
            </TableCell>
        </TableRow>
    );
});
