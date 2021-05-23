import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ReportsActions} from "./ReportsActions";
import {BanChatsCreatorsButton} from "./BanChatsCreatorsButton";
import {DeleteChatsButton} from "./DeleteChatsButton";
import {RejectReportsButton} from "./RejectReportsButton";

export const ChatReportsActions: FunctionComponent = observer(() => (
    <ReportsActions>
        <BanChatsCreatorsButton/>
        <DeleteChatsButton/>
        <RejectReportsButton/>
    </ReportsActions>
));
