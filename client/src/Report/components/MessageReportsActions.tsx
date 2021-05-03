import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BanMessagesSendersButton} from "./BanMessagesSendersButton";
import {DeleteMessagesButton} from "./DeleteMessagesButton";
import {RejectReportsButton} from "./RejectReportsButton";
import {ReportsActions} from "./ReportsActions";

export const MessageReportsActions: FunctionComponent = observer(() => (
    <ReportsActions>
        <BanMessagesSendersButton/>
        <DeleteMessagesButton/>
        <RejectReportsButton/>
    </ReportsActions>
));
