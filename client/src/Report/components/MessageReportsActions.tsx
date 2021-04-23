import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, createStyles, Grid, makeStyles, Typography} from "@material-ui/core";
import {BlockMessagesSendersButton} from "./BlockMessagesSendersButton";
import {DeleteMessagesButton} from "./DeleteMessagesButton";
import {RejectReportsButton} from "./RejectReportsButton";
import {useLocalization, useStore} from "../../store/hooks";
import {ClearReportsSelectionButton} from "./ClearReportsSelectionButton";

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

export const MessageReportsActions: FunctionComponent = observer(() => {
    const {
        messageReports: {
            numberOfSelectedReports
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    if (numberOfSelectedReports === 0) {
        return null;
    }

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
                    <Grid item xs={4} className={classes.centerAligned}>
                        <BlockMessagesSendersButton/>
                    </Grid>
                    <Grid item xs={4} className={classes.centerAligned}>
                        <DeleteMessagesButton/>
                    </Grid>
                    <Grid item xs={4} className={classes.centerAligned}>
                        <RejectReportsButton/>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});
