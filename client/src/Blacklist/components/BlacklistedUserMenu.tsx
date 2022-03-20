import React, {Fragment, FunctionComponent} from "react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {RemoveUserFromBlacklistMenuItem} from "./RemoveUserFromBlacklistMenuItem";

interface BlacklistedUserMenuProps {
    userId: string
}

export const BlacklistedUserMenu: FunctionComponent<BlacklistedUserMenuProps> = ({userId}) => {
   const popupState = usePopupState({popupId: "blacklistedUserMenu", variant: "popover"});

   return (
       <Fragment>
           <IconButton {...bindToggle(popupState)}>
               <MoreVert/>
           </IconButton>
           <Menu {...bindMenu(popupState)}>
               <RemoveUserFromBlacklistMenuItem userId={userId}
                                                onClick={popupState.close}
               />
           </Menu>
       </Fragment>
   );
};
