import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Cancel} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";

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
