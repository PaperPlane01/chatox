import React, {forwardRef} from "react";
import {observer} from "mobx-react";
import {BanMessagesSendersButton} from "./BanMessagesSendersButton";
import {DeleteMessagesButton} from "./DeleteMessagesButton";
import {RejectReportsButton} from "./RejectReportsButton";
import {ReportsActions} from "./ReportsActions";

const _MessageReportsActions = forwardRef<HTMLDivElement>((_, ref) => (
    <ReportsActions ref={ref}>
        <BanMessagesSendersButton/>
        <DeleteMessagesButton/>
        <RejectReportsButton/>
    </ReportsActions>
));

export const MessageReportsActions = observer(_MessageReportsActions);
