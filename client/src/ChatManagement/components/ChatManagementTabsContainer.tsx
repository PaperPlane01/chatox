import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useMediaQuery, useTheme} from "@mui/material";
import {ChatManagementTabs} from "./ChatManagementTabs";
import {ChatManagementMenu} from "./ChatManagementMenu";

export const ChatManagementTabsContainer: FunctionComponent = observer(() => {
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    return onSmallScreen ? <ChatManagementMenu/> : <ChatManagementTabs/>;
});
