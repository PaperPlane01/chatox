import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    Table,
    TableBody
} from "@material-ui/core";
import {ReportedMessagesTableHead} from "./ReportedMessagesTableHeader";
import {ReportedMessagesTableRow} from "./ReportedMessagesTableRow";
import {useLocalization, useStore} from "../../store/hooks";
import {ShowNotViewedOnlySwitch} from "./ShowNotViewedOnlySwitch";

export const ReportedMessagesTable: FunctionComponent = observer(() => {
    const {
        messageReports: {
            ids,
            pending,
            fetchReports
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            <CardHeader title={l("report.list.messages")}/>
            <CardContent>
                <ShowNotViewedOnlySwitch/>
                <Table>
                    <ReportedMessagesTableHead/>
                    <TableBody>
                        {ids.map(id => (<ReportedMessagesTableRow reportId={id}/>))}
                    </TableBody>
                </Table>
                {pending && <CircularProgress size={50} color="primary"/>}
            </CardContent>
            <CardActions>
                <Button variant="outlined"
                        color="primary"
                        onClick={fetchReports}
                        disabled={pending}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("common.load-more")}
                </Button>
            </CardActions>
        </Card>
    );
});
