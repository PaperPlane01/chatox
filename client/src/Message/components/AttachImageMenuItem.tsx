import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button, MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {Image} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface AttachImageMenuItemProps {
    buttonClassName?: string,
    onClick?: () => void
}

export const AttachImageMenuItem: FunctionComponent<AttachImageMenuItemProps> = observer(({
    buttonClassName,
    onClick
}) => {
    const {
        messageUploads: {
            attachImages
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
                    <Image/>
                </ListItemIcon>
                <ListItemText>
                    {l("file.image")}
                </ListItemText>
                <input type="file"
                       multiple
                       value={dummyInputValue}
                       style={{display: "none"}}
                       accept="image/png, image/jpg, image/jpeg"
                       onClick={() => setDummyInputValue("")}
                       onChange={event => {
                           event.target.files && attachImages(event.target.files);
                       }}
                />
            </Button>
        </MenuItem>
    )
})
