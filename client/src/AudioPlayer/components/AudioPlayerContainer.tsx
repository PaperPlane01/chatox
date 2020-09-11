import React, {FunctionComponent, useEffect, useRef} from "react";
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
            setPlaying,
            seekTo
        },
        entities: {
            uploads: {
                findAudio
            }
        },
    } = useStore();

    const playerRef = useRef<ReactPlayer>(null);

    useEffect(
        () => {
            if (playerRef.current && seekTo !== undefined) {
                playerRef.current.seekTo(seekTo, "fraction");
            }
        },
        [seekTo]
    );

    if (!currentTrackId) {
        return null;
    }

    const audio = findAudio(currentTrackId);

    return (
        <ReactPlayer url={`${audio.uri}/stream`}
                     playing={playing}
                     onProgress={progress => setCurrentPosition(progress.played)}
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
                     ref={playerRef}
        />
    )
})
