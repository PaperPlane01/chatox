import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ReportsActions} from "./ReportsActions";
import {BanReportedUsersButton} from "./BanReportedUsersButton";
import {RejectReportsButton} from "./RejectReportsButton";

export const UserReportsActions: FunctionComponent = observer(() => (
    <ReportsActions>
        <BanReportedUsersButton/>
        <RejectReportsButton/>
    </ReportsActions>
));
