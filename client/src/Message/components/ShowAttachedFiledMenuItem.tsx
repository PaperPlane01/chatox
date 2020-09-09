import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {ViewList} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

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
