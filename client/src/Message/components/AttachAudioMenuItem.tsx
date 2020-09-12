import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button, MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Audiotrack} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store/hooks";

interface AttachAudioMenuItemProps {
    buttonClassName?: string,
    onClick?: () => void
}

export const AttachAudioMenuItem: FunctionComponent<AttachAudioMenuItemProps> = observer(({
    buttonClassName,
    onClick
}) => {
    const {
        messageUploads: {
            attachAudios
        }
    } = useStore();
    const {l} = useLocalization();
    const [dummyInputValue, setDummyInputValue] = useState("");

    return (
        <MenuItem button
                  onClick={onClick}
        >
            <Button variant="text"
                    disableRipple
                    disableElevation
                    component="label"
                    className={buttonClassName}
            >
                <ListItemIcon>
                    <Audiotrack/>
                </ListItemIcon>
                <ListItemText>
                    {l("file.audio")}
                </ListItemText>
                <input type="file"
                       multiple
                       value={dummyInputValue}
                       style={{display: "none"}}
                       accept=".mp3"
                       onClick={() => setDummyInputValue("")}
                       onChange={event => {
                           event.target.files && attachAudios(event.target.files);
                       }}
                />
            </Button>
        </MenuItem>
    )
})
