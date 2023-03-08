import React, {Fragment, FunctionComponent} from "react";
import {IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {RemoveUserFromBlacklistMenuItem} from "./RemoveUserFromBlacklistMenuItem";

interface BlacklistedUserMenuProps {
    userId: string
}

export const BlacklistedUserMenu: FunctionComponent<BlacklistedUserMenuProps> = ({userId}) => {
   const popupState = usePopupState({popupId: "blacklistedUserMenu", variant: "popover"});

   return (
       <Fragment>
           <IconButton {...bindToggle(popupState)}
                       size="large"
           >
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
