import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

export const DeleteMessagesButton: FunctionComponent = observer(() => {
    const {
        selectedReportedMessagesDeletion: {
            deleteSelectedReportedMessages
        }
    } = useStore();
    const {l} = useLocalization();

    return <BottomNavigationAction icon={<Delete/>}
                                   label={l("report.messages.delete-messages")}
                                   showLabel
    />;
});
