import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button, MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {FileCopy} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface AttachFileMenuItemProps {
    buttonClassName?: string,
    onClick?: () => void
}

export const AttachFileMenuItem: FunctionComponent<AttachFileMenuItemProps> = observer(({
    buttonClassName,
    onClick
}) => {
    const {
        messageUploads: {
            attachAnyFiles
        }
    } = useStore();
    const {l} = useLocalization();
    const [dummyInputValue, setDummyInputValue] = useState("");

    return (
        <MenuItem component="button"
                  onClick={onClick}
        >
            <Button variant="text"
                    disableRipple
                    disableElevation
                    component="label"
                    className={buttonClassName}
            >
                <ListItemIcon>
                    <FileCopy/>
                </ListItemIcon>
                <ListItemText>
                    {l("file.file")}
                </ListItemText>
                <input type="file"
                       multiple
                       value={dummyInputValue}
                       style={{display: "none"}}
                       onClick={() => setDummyInputValue("")}
                       onChange={event => {
                           event.target.files && attachAnyFiles(event.target.files);
                       }}
                />
            </Button>
        </MenuItem>
    );
});
