import React, {ChangeEvent, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button, ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {AudioFile, Audiotrack} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {AudioType} from "../../AudioPlayer";
import {UploadType} from "../../api/types/response";

interface AttachAudioMenuItemProps {
    buttonClassName?: string,
    audioType?: AudioType,
    onClick?: () => void
}

export const AttachAudioMenuItem: FunctionComponent<AttachAudioMenuItemProps> = observer(({
    buttonClassName,
    onClick,
    audioType = UploadType.AUDIO
}) => {
    const {
        messageUploads: {
            attachAudios,
            attachVoiceMessage
        }
    } = useStore();
    const {l} = useLocalization();
    const [dummyInputValue, setDummyInputValue] = useState("");

    const handleSelect = (event: ChangeEvent<HTMLInputElement>): void => {
        if (!event.target.files) {
            return;
        }

        if (audioType === UploadType.AUDIO) {
            attachAudios(event.target.files);
        } else {
            attachVoiceMessage(event.target.files);
        }
    };

    return (
        <MenuItem onClick={onClick}
                  component="button"
        >
            <Button variant="text"
                    disableRipple
                    disableElevation
                    component="label"
                    className={buttonClassName}
            >
                <ListItemIcon>
                    {audioType === UploadType.AUDIO ? <Audiotrack/> : <AudioFile/>}
                </ListItemIcon>
                <ListItemText>
                    {audioType === UploadType.AUDIO
                        ? l("file.audio")
                        : l("message.voice.from-file")
                    }
                </ListItemText>
                <input type="file"
                       multiple
                       value={dummyInputValue}
                       style={{display: "none"}}
                       accept=".mp3"
                       onClick={() => setDummyInputValue("")}
                       onChange={handleSelect}
                />
            </Button>
        </MenuItem>
    );
});
