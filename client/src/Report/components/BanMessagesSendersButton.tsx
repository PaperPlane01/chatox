import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction} from "@mui/material";
import {Block} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const BanMessagesSendersButton: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {
        selectedReportedMessagesSendersBan: {
            setBanUsersDialogOpen
        }
    } = useStore();

    const handleClick = (): void => {
        setBanUsersDialogOpen(true);
    };

    return <BottomNavigationAction icon={<Block/>}
                                   label={l("report.messages.ban-users")}
                                   showLabel
                                   onClick={handleClick}
    />;
});
