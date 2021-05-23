import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Cancel} from "@material-ui/icons";
import {useStore, useLocalization} from "../../store/hooks";

interface CancelGlobalBanMenuItemProps {
    onClick?: () => void,
    globalBanId: string
}

export const CancelGlobalBanMenuItem: FunctionComponent<CancelGlobalBanMenuItemProps> = observer(({onClick, globalBanId}) => {
    const {
        cancelGlobalBan: {
            cancelGlobalBan
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        cancelGlobalBan(globalBanId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Cancel/>
            </ListItemIcon>
            <ListItemText>
                {l("cancel")}
            </ListItemText>
        </MenuItem>
    );
});
