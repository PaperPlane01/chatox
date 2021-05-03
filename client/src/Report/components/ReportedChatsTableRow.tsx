import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {format} from "date-fns";
import {Checkbox, createStyles, makeStyles, TableCell, TableRow, Typography} from "@material-ui/core";
import {Remove} from "@material-ui/icons";
import randomColor from "randomcolor";
import {useLocalization, useRouter, useStore} from "../../store/hooks";
import {Labels} from "../../localization/types";
import {Routes} from "../../router";

const {Link} = require("mobx-router");

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
        entities: {
            reports: {
                findById: findReport
            },
            reportedChats: {
                findById: findChat
            }
        },
        chatReports: {
            isReportSelected,
            setReportSelected
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const routerStore = useRouter();

    const reportSelected = isReportSelected(reportId);
    const report = findReport(reportId);
    const chat = findChat(report.reportedObjectId);
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
                      view={Routes.chatPage}
                      params={{slug: chat.id}}
                      store={routerStore}
                >
                    <Typography style={{color: chatColor}}>
                        <strong>{chat.name}</strong>
                    </Typography>
                </Link>
            </TableCell>
        </TableRow>
    );
});
