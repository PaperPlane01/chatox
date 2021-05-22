import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction} from "@material-ui/core";
import {Block} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

export const BanChatsCreatorsButton: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {
        selectedReportedChatsCreatorsBan: {
            setBanUsersDialogOpen
        }
    } = useStore();

    const handleClick = (): void => {
        setBanUsersDialogOpen(true);
    };

    return <BottomNavigationAction icon={<Block/>}
                                   label={l("report.chat.action.ban-chats-creators")}
                                   showLabel
                                   onClick={handleClick}
    />;
});