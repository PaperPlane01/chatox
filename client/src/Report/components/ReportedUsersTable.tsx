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
} from "@mui/material";
import {ShowNotViewedOnlySwitch} from "./ShowNotViewedOnlySwitch";
import {ReportedUsersTableHeader} from "./ReportedUsersTableHeader";
import {ReportedUsersTableRow} from "./ReportedUsersTableRow";
import {useLocalization, useStore} from "../../store";

export const ReportedUsersTable: FunctionComponent = observer(() => {
    const {
        userReports: {
            ids,
            pending,
            fetchReports
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            <CardHeader title={l("report.user.list")}/>
            <CardContent>
                <ShowNotViewedOnlySwitch/>
                <Table>
                    <ReportedUsersTableHeader/>
                    <TableBody>
                        {ids.map(id => (<ReportedUsersTableRow reportId={id}/>))}
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
