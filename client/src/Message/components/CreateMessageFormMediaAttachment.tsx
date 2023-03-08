import React, {CSSProperties, FunctionComponent, useState} from "react";
import { CircularProgress, IconButton, ListItem, ListItemText, Theme } from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Audiotrack, Close, FileCopy, VideoLibrary} from "@mui/icons-material";
import {UploadedFileContainer} from "../../utils/file-utils";
import {UploadType} from "../../api/types/response";

interface CreateMessageFormMediaAttachmentProps {
    fileContainer: UploadedFileContainer,
    progress?: number,
    onDelete?: (localFileId: string) => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    imagePreviewContainer: {
        position: "relative",
        width: 100,
        height: 100,
        minWidth: 100,
        marginRight: theme.spacing(2),
        backgroundSize: "cover",
        backgroundPosition: "center"
    },
    uploadIconContainer: {
        position: "relative",
        width: 100,
        height: 100,
        minWidth: 100,
        marginRight: theme.spacing(2),
    },
    absolutePositioned: {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%"
    },
    circularProgress: {
        color: theme.palette.common.white
    },
    listItemTextRoot: {
        overflowWrap: "break-word"
    }
}));

const iconsMap = {
    [UploadType.AUDIO]: <Audiotrack fontSize="large"/>,
    [UploadType.FILE]: <FileCopy/>,
    [UploadType.VIDEO]: <VideoLibrary/>
}

export const CreateMessageFormMediaAttachment: FunctionComponent<CreateMessageFormMediaAttachmentProps> = ({
    fileContainer,
    onDelete,
    progress
}) => {
    const [hovered, setHovered] = useState(false);
    const classes = useStyles();

    const hoveredStyle: CSSProperties = {
        boxShadow: "inset 0 0 0 1000px rgba(0, 0, 0, 0.2)"
    };

    const notHoveredStyle: CSSProperties = {};

    if (fileContainer.expectedUploadType === UploadType.IMAGE || fileContainer.expectedUploadType === UploadType.GIF) {
        hoveredStyle.backgroundImage = `url(${fileContainer.url})`;
        notHoveredStyle.backgroundImage = `url(${fileContainer.url})`;
    }

    const handleDelete = (): void => {
        if (onDelete) {
            onDelete(fileContainer.localId);
        }
    }

    return (
        <ListItem>
            {fileContainer.expectedUploadType === UploadType.IMAGE || fileContainer.expectedUploadType === UploadType.GIF
                ? (
                    <div className={classes.imagePreviewContainer}
                         style={hovered ? hoveredStyle : notHoveredStyle}
                         onMouseOver={() => setHovered(true)}
                         onMouseOut={() => setHovered(false)}
                         onTouchStart={() => setHovered(true)}
                         onTouchEnd={() => setHovered(false)}
                    >
                        {fileContainer.pending && (
                            <div className={classes.centered}>
                                <CircularProgress size={25}
                                                  className={classes.circularProgress}
                                                  value={progress}
                                                  variant={progress === 100 ? "indeterminate": "determinate"}
                                />
                            </div>
                        )}
                    </div>
                )
                : (
                    <div className={classes.uploadIconContainer}
                         style={hovered ? hoveredStyle : notHoveredStyle}
                         onMouseOver={() => setHovered(true)}
                         onMouseOut={() => setHovered(false)}
                         onTouchStart={() => setHovered(true)}
                         onTouchEnd={() => setHovered(false)}
                    >
                        <div className={classes.centered} style={{position: "relative"}}>
                            {iconsMap[fileContainer.expectedUploadType]}
                            {fileContainer.pending && (
                                <div className={classes.absolutePositioned}>
                                    <CircularProgress size={25}
                                                      color="primary"
                                                      value={progress}
                                                      variant={(progress === 100 || progress === 0) ? "indeterminate": "determinate"}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
            <ListItemText classes={{
                root: classes.listItemTextRoot
            }}>
                {fileContainer.file.name}
            </ListItemText>
            <IconButton onClick={handleDelete} size="large">
                <Close/>
            </IconButton>
        </ListItem>
    );
}
