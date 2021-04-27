import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {format} from "date-fns";
import {TableRow, TableCell, Typography, Checkbox} from "@material-ui/core";
import {Remove} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";
import {Labels} from "../../localization/types";
import {UserLink} from "../../UserLink/components";

interface ReportedUsersTableProps {
    reportId: string
}

export const ReportedUsersTableRow: FunctionComponent<ReportedUsersTableProps> = observer(({
    reportId
}) => {
    const {
        entities: {
            reports: {
                findById: findReport
            },
            reportedUsers: {
                findById: findUser
            }
        },
        userReports: {
            isReportSelected,
            setReportSelected
        }
    } = useStore();
    const {l} = useLocalization();
    const reportSelected = isReportSelected(reportId);

    const report = findReport(reportId);
    const user = findUser(report.reportedObjectId);

    return (
        <TableRow>
            <TableCell>
                <Checkbox checked={reportSelected}
                          onChange={event => setReportSelected(reportId, event.target.checked)}
                />
            </TableCell>
            <TableCell>{l(`report.reason.${report.reason}` as keyof Labels)}</TableCell>
            <TableCell>{report.description}</TableCell>
            <TableCell>{l(`report.status.${report.status}` as keyof Labels)}</TableCell>
            <TableCell>{format(report.createdAt, "dd-MM-yyyy HH:mm")}</TableCell>
            <TableCell>
                {
                    report.takenActions.length !== 0
                        ? report.takenActions.map(takenAction =>  (
                            <span>
                                {l(`report.taken-action.${takenAction}` as keyof Labels)}
                                ;
                                <br/>
                            </span>
                        ))
                        : <Remove/>
                }
            </TableCell>
            <TableCell>
                <UserLink user={user}
                          displayAvatar
                          identifierType="id"
                />
            </TableCell>
        </TableRow>
    );
});
