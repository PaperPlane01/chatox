import React, {FunctionComponent, useState} from "react";
import {CircularProgress, ListItem, ListItemText, IconButton, createStyles, makeStyles, Theme} from "@material-ui/core";
import {Close} from "@material-ui/icons";
import {UploadedFileContainer} from "../../utils/file-utils";
import {observer} from "mobx-react";
import {useStore} from "../../store/hooks";

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
    mediaFile: {
        position: "relative",
        width: 100,
        height: 100,
        minWidth: 100,
        marginRight: theme.spacing(2),
        backgroundSize: "cover",
        backgroundPosition: "center"
    },
    circularProgress: {
        color: theme.palette.common.white
    },
    listItemTextRoot: {
        overflowWrap: "break-word"
    }
}));

export const CreateMessageFormMediaAttachment: FunctionComponent<CreateMessageFormMediaAttachmentProps> = ({
    fileContainer,
    onDelete,
    progress
}) => {
    const [hovered, setHovered] = useState(false);
    const classes = useStyles();

    console.log(progress);

    const hoveredStyle = {
        backgroundImage: `url(${fileContainer.url})`,
        boxShadow: "inset 0 0 0 1000px rgba(0, 0, 0, 0.2)"
    };

    const notHoveredStyle = {
        backgroundImage: `url(${fileContainer.url})`
    };

    const handleDelete = (): void => {
        if (onDelete) {
            onDelete(fileContainer.localId);
        }
    }

    return (
        <ListItem>
            <div className={classes.mediaFile}
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
                                          variant={progress === 100 ? "indeterminate": "static"}
                        />
                    </div>
                )}
            </div>
            <ListItemText classes={{
                root: classes.listItemTextRoot
            }}>
                {fileContainer.file.name}
            </ListItemText>
            <IconButton onClick={handleDelete}>
                <Close/>
            </IconButton>
        </ListItem>
    )
}
