import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AudioPlayerControls} from "../../AudioPlayer";
import {useStore} from "../../store/hooks";

export const DrawerAudioControls: FunctionComponent = observer(() => {
    const {
        audioPlayer: {
            currentTrackId
        }
    } = useStore();

    if (!currentTrackId) {
        return null;
    }

    return <AudioPlayerControls audioId={currentTrackId}/>
})
