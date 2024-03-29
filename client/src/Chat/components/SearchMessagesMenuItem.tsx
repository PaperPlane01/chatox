import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Search} from "@mui/icons-material";
import {useStore, useLocalization} from "../../store";

interface SearchMessagesMenuItemProps {
    onClick?: () => void
}

export const SearchMessagesMenuItem: FunctionComponent<SearchMessagesMenuItemProps> = observer(({onClick}) => {
    const {
        messagesSearch: {
            setShowInput
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setShowInput(true);
    }

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Search/>
            </ListItemIcon>
            <ListItemText>
                {l("common.search")}
            </ListItemText>
        </MenuItem>
    );
});
