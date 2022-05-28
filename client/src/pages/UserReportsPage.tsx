import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, Typography} from "@mui/material";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {HasRole} from "../Authorization";
import {
    BanReportedUsersDialog, RejectReportsSnackbarManager,
    ReportedUsersTable, UserReportsActions
} from "../Report";
import {useLocalization} from "../store";

const StickyFooter = require("react-sticky-footer").default;

export const UserReportsPage: FunctionComponent = observer(() => {
    const {l} = useLocalization();

    return (
        <Grid container>
            <Grid item xs={12}>
                <AppBar title="report.user.list"/>
            </Grid>
            <Grid item xs={12}>
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
            <div style={{width: "100%"}}>
                <StickyFooter stickyStyles={{width: "100%"}} fixedStyles={{width: "100%"}}>
                    <UserReportsActions/>
                </StickyFooter>
            </div>
            <RejectReportsSnackbarManager/>
        </Grid>
    );
});

export default UserReportsPage;
