import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {format} from "date-fns";
import {TableRow, TableCell, Typography, Checkbox} from "@material-ui/core";
import {Remove} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";
import {Labels} from "../../localization/types";

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
        },
        messageReports: {
            isReportSelected,
            setReportSelected
        }
    } = useStore();
    const {l} = useLocalization();
    const reportSelected = isReportSelected(reportId);

    const report = findReport(reportId);

    return (
        <TableRow>
            <TableCell>
                <Checkbox checked={reportSelected}
                          onChange={event => setReportSelected(reportId, event.target.checked)}
                />
            </TableCell>
            <TableCell>{l(`report.reason.${report.reason}` as keyof Labels)}</TableCell>
            <TableCell>{l(`report.status.${report.status}` as keyof Labels)}</TableCell>
            <TableCell>{format(report.createdAt, "dd-MM-yyyy HH:mm")}</TableCell>
            <TableCell>
                {
                    report.takenActions.length !== 0
                        ? report.takenActions.map(takenAction => `${takenAction}; `)
                        : <Remove/>
                }
            </TableCell>
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
