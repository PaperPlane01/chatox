import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

export const BanMessagesSendersButton: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {
        selectedReportedMessagesSendersBan: {
            setBanSendersOfSelectedMessagesDialogOpen
        }
    } = useStore();

    const handleClick = (): void => {
        setBanSendersOfSelectedMessagesDialogOpen(true);
    };

    return <BottomNavigationAction icon={<Block/>}
                                   label={l("report.messages.ban-users")}
                                   showLabel
                                   onClick={handleClick}
    />;
});
