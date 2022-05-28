import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import { Badge, IconButton, CircularProgress, Typography, Theme } from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {FileCopy} from "@mui/icons-material";
import prettyBytes from "pretty-bytes";
import {useStore} from "../../store";

interface MessageFileProps {
    chatUploadId: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    fileContainer: {
        display: "flex",
        alignItems: "center"
    },
    fileTypographyRoot: {
        paddingBottom: "0px !important"
    },
    fileSizeCaption: {
        paddingRight: theme.spacing(1)
    }
}))

export const MessageFile: FunctionComponent<MessageFileProps> = observer(({
    chatUploadId
}) => {
    const {
        entities: {
            chatUploads: {
                findById: findChatUpload
            },
            uploads: {
                findById: findUpload
            }
        },
        messageFileDownload: {
            downloadFile,
            downloadProgressMap
        }
    } = useStore();
    const classes = useStyles();

    const file = findUpload(findChatUpload(chatUploadId).uploadId);

    const handleDownloadButtonClick = (): void => {
        if (!downloadProgressMap[file.name] || !downloadProgressMap[file.name].downloading) {
            downloadFile(file.name, file.originalName);
        }
    }

    return (
        <div className={classes.fileContainer}>
            <IconButton onClick={handleDownloadButtonClick} size="large">
                <Badge badgeContent={downloadProgressMap[file.name] && downloadProgressMap[file.name].downloading && (
                    <CircularProgress color="primary" variant="determinate" value={downloadProgressMap[file.name].percentage} size={15}/>
                )}
                       anchorOrigin={{
                           horizontal: "right",
                           vertical: "bottom"
                       }}
                >
                    <FileCopy/>
                </Badge>
            </IconButton>
            <Typography variant="caption"
                        color="textSecondary"
                        classes={{
                            root: classes.fileTypographyRoot
                        }}
                        className={classes.fileSizeCaption}
            >
                {prettyBytes(file.size)}
            </Typography>
            <Typography classes={{
                root: classes.fileTypographyRoot
            }}>
                {file.originalName}
            </Typography>
        </div>
    );
})
