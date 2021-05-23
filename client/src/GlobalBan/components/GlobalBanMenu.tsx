import React, {FunctionComponent, Fragment} from "react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {CancelGlobalBanMenuItem} from "./CancelGlobalBanMenuItem";
import {UpdateGlobalBanMenuItem} from "./UpdateGlobalBanMenuItem";

interface GlobalBanMenuProps {
    globalBanId: string
}

export const GlobalBanMenu: FunctionComponent<GlobalBanMenuProps> = ({globalBanId}) => {
    const globalBanMenuPopupState = usePopupState({
        variant: "popover",
        popupId: "globalBanMenu"
    });

    return (
        <Fragment>
            <IconButton {...bindToggle(globalBanMenuPopupState)}>
                <MoreVert/>
            </IconButton>
            <Menu {...bindMenu(globalBanMenuPopupState)}>
                <UpdateGlobalBanMenuItem globalBanId={globalBanId} onClick={globalBanMenuPopupState.close}/>
                <CancelGlobalBanMenuItem globalBanId={globalBanId} onClick={globalBanMenuPopupState.close}/>
            </Menu>
        </Fragment>
    );
};
