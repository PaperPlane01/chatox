import React, {forwardRef} from "react";
import {observer} from "mobx-react";
import {ReportsActions} from "./ReportsActions";
import {BanChatsCreatorsButton} from "./BanChatsCreatorsButton";
import {DeleteChatsButton} from "./DeleteChatsButton";
import {RejectReportsButton} from "./RejectReportsButton";

const _ChatReportsActions = forwardRef<HTMLDivElement>((_, ref) => (
    <ReportsActions ref={ref}>
        <BanChatsCreatorsButton/>
        <DeleteChatsButton/>
        <RejectReportsButton/>
    </ReportsActions>
));

export const ChatReportsActions = observer(_ChatReportsActions);
