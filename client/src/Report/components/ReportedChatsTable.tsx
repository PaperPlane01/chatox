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
import {ShowNotViewedOnlySwitch} from "./ShowNotViewedOnlySwitch";
import {ReportedChatsTableHeader} from "./ReportedChatsTableHeader";
import {ReportedChatsTableRow} from "./ReportedChatsTableRow";
import {useLocalization, useStore} from "../../store/hooks";

export const ReportedChatsTable: FunctionComponent = observer(() => {
    const {
        chatReports: {
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
                    <ReportedChatsTableHeader/>
                    <TableBody>
                        {ids.map(id => (<ReportedChatsTableRow reportId={id}/>))}
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
