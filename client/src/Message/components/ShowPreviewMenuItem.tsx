import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Code} from "@mui/icons-material";
import {useLocalization} from "../../store";

interface ShowPreviewMenuItemProps {
    onClick: () => void
}

export const ShowPreviewMenuItem: FunctionComponent<ShowPreviewMenuItemProps> = observer(({
    onClick
}) => {
    const {l} = useLocalization();

    return (
        <MenuItem onClick={onClick}>
            <ListItemIcon>
                <Code/>
            </ListItemIcon>
            <ListItemText>
                {l("message.preview")}
            </ListItemText>
        </MenuItem>
    );
});
