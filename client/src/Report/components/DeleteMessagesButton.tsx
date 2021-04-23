import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction, CircularProgress} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

export const DeleteMessagesButton: FunctionComponent = observer(() => {
    const {
        selectedReportedMessagesDeletion: {
            pending,
            deleteSelectedReportedMessages
        }
    } = useStore();
    const {l} = useLocalization();

    return <BottomNavigationAction icon={pending ? <CircularProgress size={15} color="primary"/> : <Delete/>}
                                   label={l("report.messages.delete-messages")}
                                   showLabel
                                   onClick={deleteSelectedReportedMessages}
                                   disabled={pending}
    />;
});
