import React, {FunctionComponent, useState} from "react";
import {CircularProgress, ListItem, ListItemText, createStyles, makeStyles, Theme} from "@material-ui/core";
import {UploadedFileContainer} from "../../utils/file-utils";

interface CreateMessageFormMediaAttachmentProps {
    fileContainer: UploadedFileContainer,
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
    }
}));

export const CreateMessageFormMediaAttachment: FunctionComponent<CreateMessageFormMediaAttachmentProps> = ({
    fileContainer,
    onDelete
}) => {
    const [hovered, setHovered] = useState(false);
    const classes = useStyles();

    const hoveredStyle = {
        backgroundImage: `url(${fileContainer.url})`,
        boxShadow: "inset 0 0 0 1000px rgba(0, 0, 0, 0.2)"
    };

    const notHoveredStyle = {
        backgroundImage: `url(${fileContainer.url})`
    };

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
                        <CircularProgress size={25} className={classes.circularProgress}/>
                    </div>
                )}
            </div>
            <ListItemText>
                {fileContainer.file.name}
            </ListItemText>
        </ListItem>
    )
}
