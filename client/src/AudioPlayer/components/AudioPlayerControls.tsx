import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu, Slider, Theme, Typography} from "@mui/material";
import {Mark} from "@mui/base";
import {createStyles, makeStyles} from "@mui/styles";
import {Pause, PlayArrow, VolumeDown, VolumeOff, VolumeUp} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {format} from "date-fns";
import {WaveForm} from "./WaveForm";
import {AudioType} from "../types";
import {useStore} from "../../store";
import {UploadType} from "../../api/types/response";

interface AudioPlayerControlsProps {
    audioId: string,
    audioType: AudioType,
    hideWaveForm?: boolean
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    trackSliderMark: {
        width: 0,
        height: 0
    },
    trackMarkLabel: {
        top: 0,
        paddingTop: Number(theme.spacing(3).replace("px", "")) + 2
    },
    trackSliderMarked: {
        paddingBottom: theme.spacing(4),
        marginBottom: 0
    },
    trackSliderRoot: {
      paddingTop: theme.spacing(1)
    },
    volumeMenuPaper: {
        overflowY: "hidden"
    },
    volumeSlider: {
        height: 100
    },
    sliderThumb: {
        width: 15,
        height: 15
    },
    volumeSliderThumb: {
        marginBottom: 0,
        width: 15,
        height: 15
    },
    playerControlsWrapper: {
        display: "flex",
        width: "80%",
        alignItems: "flex-start",
        [theme.breakpoints.down("lg")]: {
            width: "90%"
        }
    },
    playerWaveFormContainer: {
        maxWidth: "100%"
    },
    playerSliderContainer: {
        width: "100%"
    },
    audioTrackTypography: {
        paddingBottom: "0px !important"
    }
}));

export const AudioPlayerControls: FunctionComponent<AudioPlayerControlsProps> = observer(({
    audioId,
    audioType,
    hideWaveForm = false
}) => {
    const {
        entities: {
            uploads: {
                findAudio,
                findVoiceMessage
            }
        },
        audioPlayer: {
            playing,
            currentTrackId,
            currentPosition,
            volume,
            setCurrentTrackId,
            setCurrentTrackType,
            setPlaying,
            setVolume,
            setSeekTo
        }
    } = useStore();
    const classes = useStyles();
    const volumePopupState = usePopupState({
        popupId: "volumePopup",
        variant: "popover"
    });

    const voiceMessage = audioType === UploadType.VOICE_MESSAGE;
    const audio = voiceMessage
        ? findVoiceMessage(audioId)
        : findAudio(audioId);
    const sliderMarks: Mark[] = [
        {
            value: 0,
            label: currentTrackId === audioId
                ? format(
                    new Date(0, 0, 0, 0, 0, Math.round((audio.meta!.duration / 1000) * currentPosition)),
                    "mm:ss"
                )
                : format(
                    new Date(0, 0, 0, 0, 0, 0),
                    "mm:ss"
                )
        },
        {
            value: 1,
            label: format(
                new Date(0, 0, 0, 0, 0, Math.round(audio.meta!.duration) / 1000),
                "mm:ss"
            )
        }
    ];

    const displayWaveForm = !hideWaveForm
        && audio.meta
        && audio.meta.waveForm
        && audio.meta.waveForm.length !== 0;

    return (
        <div className={classes.playerControlsWrapper}>
            {playing && currentTrackId === audioId && (
                <IconButton onClick={() => setPlaying(false)} size="large">
                    <Pause/>
                </IconButton>
            )}
            {(!playing || (currentTrackId !== audioId)) && (
                <IconButton
                    onClick={() => {
                        setCurrentTrackId(audioId);
                        setCurrentTrackType(audioType);
                        setPlaying(true);
                    }}
                    size="large"
                >
                    <PlayArrow/>
                </IconButton>
            )}
            <div className={classes.playerSliderContainer}>
                {displayWaveForm
                    ? (
                        <div className={classes.playerWaveFormContainer}>
                            <WaveForm waveForm={audio.meta!.waveForm!}
                                      playerProgress={currentPosition}
                                      audioId={audioId}
                                      currentlyPlaying={audioId === currentTrackId}
                            />
                        </div>
                    )
                    : (
                        <Typography variant="body2" className={classes.audioTrackTypography}>
                            {audio.originalName.substring(0, audio.originalName.length - audio.extension.length - 1)}
                        </Typography>
                    )
                }
                <Slider value={currentTrackId === audioId ? currentPosition : 0}
                        max={1}
                        marks={sliderMarks}
                        classes={{
                            root: classes.trackSliderRoot,
                            mark: classes.trackSliderMark,
                            marked: classes.trackSliderMarked,
                            markLabel: classes.trackMarkLabel,
                            thumb: classes.sliderThumb
                        }}
                        onChange={(_, value) => {
                            if (currentTrackId === audioId) {
                                setSeekTo(value as number);
                            }
                        }}
                        step={0.01}
                />
            </div>
            <IconButton {...bindToggle(volumePopupState)} size="large">
                {volume >= 0.6 && (
                    <VolumeUp/>
                )}
                {volume < 0.6 && volume > 0 && (
                    <VolumeDown/>
                )}
                {volume === 0 && (
                    <VolumeOff/>
                )}
            </IconButton>
            <Menu {...bindMenu(volumePopupState)}
                  anchorOrigin={{
                      vertical: "center",
                      horizontal: "right"
                  }}
                  classes={{
                      paper: classes.volumeMenuPaper
                  }}
            >
                <Slider value={volume}
                        onChange={(_, value) => setVolume(value as number)}
                        orientation="vertical"
                        style={{
                            height: 100
                        }}
                        classes={{
                            thumb: classes.volumeSliderThumb
                        }}
                        max={1}
                        step={0.000001}
                />
            </Menu>
        </div>
    );
});
