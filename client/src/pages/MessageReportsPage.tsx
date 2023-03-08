import React, {CSSProperties, FunctionComponent, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {Grid, Typography} from "@mui/material";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {HasRole} from "../Authorization";
import {
    MessageReportsActions,
    RejectReportsSnackbarManager,
    ReportedMessageDialog,
    ReportedMessagesTable,
    DeleteMessagesSnackbarManager,
    BanMessageSendersDialog
} from "../Report";
import {useLocalization, useStore} from "../store";

export const MessageReportsPage: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const reportsActionsRef = useRef<HTMLDivElement>(null);
    const [reportsStyles, setReportsStyles] = useState<CSSProperties | undefined>(undefined);
    const {
        messageReports: {
            selectedReportsIds
        }
    } = useStore();

    useEffect(() => {
        if (reportsActionsRef && reportsActionsRef.current) {
            setReportsStyles({
                paddingBottom: reportsActionsRef.current.getBoundingClientRect().height
            });
        }
    }, [reportsActionsRef, selectedReportsIds.length]);

    return (
        <Grid container>
            <Grid item xs={12}>
                <AppBar title="report.list.messages"/>
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
                        <ReportedMessagesTable/>
                    </HasRole>
                </Layout>
            </Grid>
            <ReportedMessageDialog/>
            <MessageReportsActions ref={reportsActionsRef}/>
            <RejectReportsSnackbarManager/>
            <DeleteMessagesSnackbarManager/>
            <BanMessageSendersDialog/>
        </Grid>
    );
});

export default MessageReportsPage;
