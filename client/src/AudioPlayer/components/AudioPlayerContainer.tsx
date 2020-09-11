import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import ReactPlayer from "react-player";
import {useStore} from "../../store/hooks";

export const AudioPlayerContainer: FunctionComponent = observer(() => {
    const {
        audioPlayer: {
            currentTrackId,
            playing,
            volume,
            setCurrentPosition,
            setPlaying
        },
        entities: {
            uploads: {
                findAudio
            }
        },
    } = useStore();

    if (!currentTrackId) {
        return null;
    }

    const audio = findAudio(currentTrackId);

    return (
        <ReactPlayer url={audio.uri}
                     playing={playing}
                     onProgress={progress => {
                         setCurrentPosition(progress.played);
                     }}
                     style={{
                         display: "none"
                     }}
                     width={0}
                     height={0}
                     onEnded={() => {
                         setPlaying(false);
                         setCurrentPosition(0);
                     }}
                     volume={volume}
        />
    )
})
