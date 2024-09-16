import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {ViewList} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface ShowAttachedFilesMenuItemProps {
    onClick?: () => void
}

export const ShowAttachedFilesMenuItem: FunctionComponent<ShowAttachedFilesMenuItemProps> = observer(({
    onClick
}) => {
    const {
        messageUploads: {
            setAttachedFilesDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setAttachedFilesDialogOpen(true);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <ViewList/>
            </ListItemIcon>
            <ListItemText>
                {l("file.show-files")}
            </ListItemText>
        </MenuItem>
    );
})
