import React, {FunctionComponent, useEffect, useRef} from "react";
import {observer} from "mobx-react";
import ReactPlayer from "react-player";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";
import {isDefined} from "../../utils/object-utils";

export const AudioPlayerContainer: FunctionComponent = observer(() => {
    const {
        audioPlayer: {
            currentTrackId,
            playing,
            volume,
            setCurrentTime,
            setPlaying,
            seekToTime
        }
    } = useStore();
    const playerRef = useRef<HTMLVideoElement | null>(null);

    useEffect(
        () => {
            if (playerRef.current && isDefined(seekToTime) && playing) {
                playerRef.current.fastSeek(seekToTime);
            }
        },
        [seekToTime]
    );

    const audio = useEntityById("uploads", currentTrackId);

    if (!audio) {
        return null;
    }

    const handleTimeUpdate = (): void => {
        if (playerRef?.current) {
            setCurrentTime(playerRef.current.currentTime);
        }
    }

    return (
        <ReactPlayer src={`${audio.uri}/stream`}
                     playing={playing}
                     onTimeUpdate={handleTimeUpdate}
                     style={{
                         display: "none"
                     }}
                     width={0}
                     height={0}
                     onEnded={() => {
                         setPlaying(false);
                         setCurrentTime(0);
                     }}
                     volume={volume}
                     ref={playerRef}
        />
    );
});
