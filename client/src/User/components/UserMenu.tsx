import React, {FunctionComponent, Fragment, ReactNode} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {usePopupState, bindMenu, bindToggle} from "material-ui-popup-state/hooks";
import {canReportUser, ReportUserMenuItem} from "../../Report";
import {useAuthorization} from "../../store/hooks";

interface UserMenuProps {
    userId: string
}

export const UserMenu: FunctionComponent<UserMenuProps> = observer(({
    userId
}) => {
    const {currentUser} = useAuthorization();
    const popupState = usePopupState({popupId: "userMenu", variant: "popper"});

    const menuItems: ReactNode[] = [];

    if (canReportUser(userId, currentUser)) {
        menuItems.push(<ReportUserMenuItem userId={userId} onClick={popupState.close}/>);
    }

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <Fragment>
            <IconButton {...bindToggle(popupState)}>
                <MoreVert/>
            </IconButton>
            <Menu {...bindMenu(popupState)}>
                {menuItems}
            </Menu>
        </Fragment>
    );
});
