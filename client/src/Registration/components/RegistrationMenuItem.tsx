import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@material-ui/core";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import {useLocalization, useStore} from "../../store";

interface RegistrationMenuItemProps {
    onClick?: () => void
}

export const RegistrationMenuItem: FunctionComponent<RegistrationMenuItemProps> = observer(({
    onClick
}) => {
    const {
        registrationDialog: {
            setRegistrationDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick()
        }

        setRegistrationDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <PersonAddIcon/>
            </ListItemIcon>
            <ListItemText>
                {l("register")}
            </ListItemText>
        </MenuItem>
    )
});
