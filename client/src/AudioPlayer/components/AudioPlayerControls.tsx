import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu, Slider, Theme, Typography} from "@mui/material";
import {Mark} from "@mui/base";
import {createStyles, makeStyles} from "@mui/styles";
import {Pause, PlayArrow, VolumeDown, VolumeOff, VolumeUp} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {format} from "date-fns";
import {useStore} from "../../store";

interface AudioPlayerControlsProps {
    audioId: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    trackSliderMark: {
        width: 0,
        height: 0
    },
    trackMarkLabel: {
        top: 0,
        paddingTop: theme.spacing(3) + 2,
        [theme.breakpoints.down('lg')]: {
            paddingTop: theme.spacing(2)
        }
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
    volumeSliderThumb: {
        marginBottom: 0
    },
    playerControlsWrapper: {
        display: "flex",
        width: "80%",
        alignItems: "flex-start",
        [theme.breakpoints.down('lg')]: {
            width: "90%"
        }
    },
    playerSliderContainer: {
        width: "100%"
    },
    audioTrackTypography: {
        paddingBottom: "0px !important"
    }
}))

export const AudioPlayerControls: FunctionComponent<AudioPlayerControlsProps> = observer(({
    audioId
}) => {
    const {
        entities: {
            uploads: {
                findAudio
            }
        },
        audioPlayer: {
            playing,
            currentTrackId,
            currentPosition,
            volume,
            setCurrentTrackId,
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

    const audio = findAudio(audioId);
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

    return (
        <div>
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
                            setPlaying(true);
                        }}
                        size="large">
                        <PlayArrow/>
                    </IconButton>
                )}
                <div className={classes.playerSliderContainer}>
                    <Typography variant="body2" className={classes.audioTrackTypography}>
                        {audio.originalName.substring(0, audio.originalName.length - audio.extension.length - 1)}
                    </Typography>
                    <Slider value={currentTrackId === audioId ? currentPosition : 0}
                            max={1}
                            marks={sliderMarks}
                            classes={{
                                root: classes.trackSliderRoot,
                                mark: classes.trackSliderMark,
                                marked: classes.trackSliderMarked,
                                markLabel: classes.trackMarkLabel
                            }}
                            onChange={(_, value) => {
                                if (currentTrackId === audioId) {
                                    setSeekTo(value as number);
                                }
                            }}
                            step={0.01}
                    />
                </div>
                <Fragment>
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
                </Fragment>
            </div>
        </div>
    );
})
