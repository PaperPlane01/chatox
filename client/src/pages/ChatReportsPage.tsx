import React, {CSSProperties, FunctionComponent, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {Grid, Typography} from "@mui/material";
import {Layout} from "../Layout";
import {AppBar} from "../AppBar";
import {HasRole} from "../Authorization";
import {BanChatsCreatorsDialog, ChatReportsActions, RejectReportsSnackbarManager, ReportedChatsTable} from "../Report";
import {useLocalization, useStore} from "../store";

export const ChatReportsPage: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {
        chatReports: {
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
                <AppBar title="report.chat.list"/>
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
                        <ReportedChatsTable/>
                    </HasRole>
                </Layout>
            </Grid>
            <ChatReportsActions ref={actionsRef}/>
            <RejectReportsSnackbarManager/>
            <BanChatsCreatorsDialog/>
        </Grid>
    );
});

export default ChatReportsPage;
