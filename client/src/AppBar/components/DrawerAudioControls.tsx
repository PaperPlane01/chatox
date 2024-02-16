import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AudioPlayerControls} from "../../AudioPlayer";
import {useStore} from "../../store";

export const DrawerAudioControls: FunctionComponent = observer(() => {
    const {
        audioPlayer: {
            currentTrackId,
            currentTrackType
        }
    } = useStore();

    if (!currentTrackId || !currentTrackType) {
        return null;
    }

    return (
        <AudioPlayerControls audioId={currentTrackId}
                             audioType={currentTrackType}
                             hideWaveForm
        />
    )
})
