import React, {FunctionComponent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import ReactPlayer from "react-player";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";

export const AudioPlayerContainer: FunctionComponent = observer(() => {
    const {
        audioPlayer: {
            currentTrackId,
            playing,
            volume,
            setCurrentPosition,
            setPlaying,
            seekTo
        }
    } = useStore();

    const playerRef = useRef<ReactPlayer>(null);

    useEffect(
        () => {
            if (playerRef.current && seekTo !== undefined && playing) {
                playerRef.current.seekTo(seekTo, "fraction");
            }
        },
        [seekTo]
    );

    const audio = useEntityById("uploads", currentTrackId);

    if (!audio) {
        return null;
    }

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
    );
});
