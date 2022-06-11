import React, {CSSProperties, FunctionComponent, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {Grid, Typography} from "@mui/material";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {HasRole} from "../Authorization";
import {BanReportedUsersDialog, RejectReportsSnackbarManager, ReportedUsersTable, UserReportsActions} from "../Report";
import {useLocalization, useStore} from "../store";

export const UserReportsPage: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {
        userReports: {
            selectedReportsIds
        }
    } = useStore();

    const [reportsStyles, setReportsStyles] = useState<CSSProperties | undefined>(undefined);
    const actionsRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            if (actionsRef && actionsRef.current) {
                setReportsStyles({
                    paddingBottom: actionsRef.current.getBoundingClientRect().height
                });
            }
        },
        [actionsRef, selectedReportsIds]
    )

    return (
        <Grid container>
            <Grid item xs={12}>
                <AppBar title="report.user.list"/>
            </Grid>
            <Grid item xs={12} style={reportsStyles}>
                <Layout>
                    <HasRole role="ROLE_ADMIN"
                             alternative={
                                 <Typography>
                                     You have to be admin to view this page.
                                 </Typography>
                             }
                    >
                        <ReportedUsersTable/>
                    </HasRole>
                </Layout>
            </Grid>
            <BanReportedUsersDialog/>
            <UserReportsActions ref={actionsRef}/>
            <RejectReportsSnackbarManager/>
        </Grid>
    );
});

export default UserReportsPage;
