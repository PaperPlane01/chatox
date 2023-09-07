import React, {FunctionComponent, Fragment, ReactNode} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {usePopupState, bindMenu, bindToggle} from "material-ui-popup-state/hooks";
import {canReportUser, ReportUserMenuItem} from "../../Report";
import {UserInteractionsHistoryMenuItem} from "../../UserInteraction";
import {useAuthorization} from "../../store";

interface UserMenuProps {
    userId: string
}

export const UserMenu: FunctionComponent<UserMenuProps> = observer(({
    userId
}) => {
    const {currentUser} = useAuthorization();
    const popupState = usePopupState({popupId: "userMenu", variant: "popper"});

    const menuItems: ReactNode[] = [];

    menuItems.push(<UserInteractionsHistoryMenuItem onClick={popupState.close}/>)

    if (canReportUser(userId, currentUser)) {
        menuItems.push(<ReportUserMenuItem userId={userId} onClick={popupState.close}/>);
    }

    return (
        <Fragment>
            <IconButton {...bindToggle(popupState)} size="large">
                <MoreVert/>
            </IconButton>
            <Menu {...bindMenu(popupState)}>
                {menuItems}
            </Menu>
        </Fragment>
    );
});
