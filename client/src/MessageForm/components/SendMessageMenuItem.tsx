import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Send} from "@mui/icons-material";
import {useLocalization} from "../../store";

interface SendMessageMenuItemProps {
    onClick: () => void
}

export const SendMessageMenuItem: FunctionComponent<SendMessageMenuItemProps> = observer(({
    onClick
}) => {
    const {l} = useLocalization();

    return (
        <MenuItem onClick={onClick}>
            <ListItemIcon>
                <Send/>
            </ListItemIcon>
            <ListItemText>
                {l("message.send")}
            </ListItemText>
        </MenuItem>
    );
});