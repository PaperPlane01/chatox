import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Hidden} from "@mui/material";
import {ChatManagementTabs} from "./ChatManagementTabs";
import {ChatManagementMenu} from "./ChatManagementMenu";

export const ChatManagementTabsContainer: FunctionComponent = observer(() => (
    <Fragment>
        <Hidden xlDown>
            <ChatManagementTabs/>
        </Hidden>
        <Hidden lgUp>
            <ChatManagementMenu/>
        </Hidden>
    </Fragment>
));
