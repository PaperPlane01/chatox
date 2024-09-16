import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {format} from "date-fns";
import {Checkbox, TableCell, TableRow, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Remove} from "@mui/icons-material";
import randomColor from "randomcolor";
import {Link} from "mobx-router";
import {useLocalization, useRouter, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {Labels} from "../../localization";
import {Routes} from "../../router";

interface ReportedChatsTableRowProps {
    reportId: string
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const ReportedChatsTableRow: FunctionComponent<ReportedChatsTableRowProps> = observer(({
    reportId
}) => {
    const {
        chatReports: {
            isReportSelected,
            setReportSelected
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const routerStore = useRouter();

    const reportSelected = isReportSelected(reportId);
    const report = useEntityById("reports", reportId);
    const chat = useEntityById("reportedChats", report.reportedObjectId);
    const chatColor = randomColor({seed: chat.id});

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
                <Link className={classes.undecoratedLink}
                      route={Routes.chatPage}
                      params={{slug: chat.id}}
                      router={routerStore}
                >
                    <Typography style={{color: chatColor}}>
                        <strong>{chat.name}</strong>
                    </Typography>
                </Link>
            </TableCell>
        </TableRow>
    );
});
