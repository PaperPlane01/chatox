import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

export const BanReportedUsersButton: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {
        selectedReportedUsersBan: {
            setBanSelectedReportedUsersDialogOpen
        }
    } = useStore();

    const handleClick = (): void => {
        setBanSelectedReportedUsersDialogOpen(true);
    };

    return <BottomNavigationAction icon={<Block/>}
                                   label={l("report.user.action.ban-users")}
                                   showLabel
                                   onClick={handleClick}
    />;
});
