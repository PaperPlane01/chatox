import React, {forwardRef} from "react";
import {observer} from "mobx-react";
import {ReportsActions} from "./ReportsActions";
import {BanReportedUsersButton} from "./BanReportedUsersButton";
import {RejectReportsButton} from "./RejectReportsButton";

const _UserReportsActions = forwardRef<HTMLDivElement>((_, ref) => (
    <ReportsActions ref={ref}>
        <BanReportedUsersButton/>
        <RejectReportsButton/>
    </ReportsActions>
));

export const UserReportsActions = observer(_UserReportsActions);
