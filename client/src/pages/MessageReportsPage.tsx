import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, Typography} from "@material-ui/core";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {HasRole} from "../Authorization";
import {
    MessageReportsActions,
    RejectReportsSnackbarManager,
    ReportedMessageDialog,
    ReportedMessagesTable,
    DeleteMessagesSnackbarManager
} from "../Report";
import {useLocalization} from "../store/hooks";

const StickyFooter = require("react-sticky-footer").default;

export const MessageReportsPage: FunctionComponent = observer(() => {
    const {l} = useLocalization();

    return (
        <Grid container>
            <Grid item xs={12}>
                <AppBar title="report.list.messages"/>
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
                        <ReportedMessagesTable/>
                    </HasRole>
                </Layout>
            </Grid>
            <ReportedMessageDialog/>
            <div style={{width: "100%"}}>
                <StickyFooter stickyStyles={{width: "100%"}} fixedStyles={{width: "100%"}}>
                    <MessageReportsActions/>
                </StickyFooter>
            </div>
            <RejectReportsSnackbarManager/>
            <DeleteMessagesSnackbarManager/>
        </Grid>
    );
});

export default MessageReportsPage;
