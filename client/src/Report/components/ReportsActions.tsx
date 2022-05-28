import React, {FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import { Card, CardContent, Grid, GridSize, Typography } from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ClearReportsSelectionButton} from "./ClearReportsSelectionButton";
import {useLocalization, useStore} from "../../store";

interface ReportsActionsProps {
    children: ReactNode[]
}

const useStyles = makeStyles(() => createStyles({
    centerAligned: {
        textAlign: "center"
    },
    fullWidth: {
        width: "100%"
    },
    floatRight: {
        display: "inline",
        float: "right"
    }
}));

export const ReportsActions: FunctionComponent<ReportsActionsProps> = observer(({children}) => {
    const {
        currentReportsList: {
            currentReportsList: {
                numberOfSelectedReports
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    if (children.length === 0) {
        return null;
    }

    if (numberOfSelectedReports === 0) {
        return null;
    }

    const actionWidth = 12 / children.length as unknown as GridSize;

    return (
        <Card raised
              className={classes.fullWidth}
        >
            <CardContent>
                <Typography variant="h6">
                    {l("report.list.selected-reports.count", {selectedReportsCount: numberOfSelectedReports})}
                    <div className={classes.floatRight}>
                        <ClearReportsSelectionButton/>
                    </div>
                </Typography>
                <Grid container
                      alignItems="center"
                >
                    {children.map(action => (
                        <Grid item xs={actionWidth} className={classes.centerAligned}>
                            {action}
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
});
