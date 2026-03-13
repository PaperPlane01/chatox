import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu, Slider, Theme, Typography, SliderProps} from "@mui/material";
import {Pause, PlayArrow, VolumeDown, VolumeOff, VolumeUp} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {format} from "date-fns";
import {WaveForm} from "./WaveForm";
import {AudioType} from "../types";
import {useStore} from "../../store";
import {UploadType} from "../../api/types/response";
import {useEntitySelector} from "../../entities";

type Marks = SliderProps["marks"];

interface AudioPlayerControlsProps {
    audioId: string,
    audioType: AudioType,
    hideWaveForm?: boolean,
    fullWidth?: boolean,
    waveFormViewBox?: string
}

const useStyles = makeStyles()((theme: Theme) => ({
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
        alignItems: "flex-start",
        [theme.breakpoints.down("lg")]: {
            width: "90%"
        }
    },
    notFullWidth: {
        width: "80%",
        [theme.breakpoints.down("lg")]: {
            width: "90%"
        }
    },
    fullWidth: {
      width: "100%"
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
    hideWaveForm = false,
    fullWidth = false,
    waveFormViewBox
}) => {
    const {
        audioPlayer: {
            playing,
            currentTrackId,
            currentTimeFraction,
            volume,
            setCurrentTrackId,
            setCurrentTrackType,
            setPlaying,
            setVolume,
            setSeekToFraction
        }
    } = useStore();
    const {classes, cx} = useStyles();
    const volumePopupState = usePopupState({
        popupId: "volumePopup",
        variant: "popover"
    });

    const voiceMessage = audioType === UploadType.VOICE_MESSAGE;
    const audio = useEntitySelector(
        "uploads",
            entities => voiceMessage
                ? entities.uploads.findVoiceMessage(audioId)
                : entities.uploads.findAudio(audioId)
    );
    const sliderMarks: Marks = [
        {
            value: 0,
            label: currentTrackId === audioId
                ? format(
                    new Date(0, 0, 0, 0, 0, Math.round((audio.meta!.duration / 1000) * currentTimeFraction)),
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

    const displayWaveForm = !hideWaveForm && audio.meta?.waveForm?.length !== 0;

    const wrapperClasses = cx({
        [classes.playerControlsWrapper]: true,
        [classes.fullWidth]: fullWidth,
        [classes.notFullWidth]: !fullWidth
    });

    return (
        <div className={wrapperClasses}>
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
                {displayWaveForm && audio.meta?.waveForm
                    ? (
                        <div className={classes.playerWaveFormContainer}>
                            <WaveForm waveForm={audio.meta.waveForm}
                                      playerProgress={currentTimeFraction}
                                      audioId={audioId}
                                      currentlyPlaying={audioId === currentTrackId}
                                      viewBox={waveFormViewBox}
                            />
                        </div>
                    )
                    : (
                        <Typography variant="body2" className={classes.audioTrackTypography}>
                            {audio.originalName.substring(0, audio.originalName.length - audio.extension.length - 1)}
                        </Typography>
                    )
                }
                <Slider value={currentTrackId === audioId ? currentTimeFraction : 0}
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
                                setSeekToFraction(value as number);
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
