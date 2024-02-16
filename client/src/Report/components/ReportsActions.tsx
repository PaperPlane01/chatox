import React, {forwardRef, ReactNode} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, Grid, GridSize, Typography} from "@mui/material";
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
    cardRoot: {
        width: "100%",
        position: "fixed",
        bottom: 0
    },
    floatRight: {
        display: "inline",
        float: "right"
    }
}));

export const _RepostsActions = forwardRef<HTMLDivElement, ReportsActionsProps>((props, ref) => {
    const {
        currentReportsList: {
            currentReportsList: {
                numberOfSelectedReports
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    if (props.children.length === 0) {
        return null;
    }

    if (numberOfSelectedReports === 0) {
        return null;
    }

    const actionWidth = 12 / props.children.length as unknown as GridSize;

    return (
        <Card raised
              classes={{
                  root: classes.cardRoot
              }}
              ref={ref}
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
                    {props.children.map((action, index) => (
                        <Grid item xs={actionWidth} className={classes.centerAligned} key={index}>
                            {action}
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
})

export const ReportsActions = observer(_RepostsActions);