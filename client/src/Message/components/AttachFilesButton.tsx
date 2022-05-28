import React, {Fragment, FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {
    Badge,
    CircularProgress,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {AttachFile, VideoLibrary} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {useSnackbar} from "notistack";
import {AttachImageMenuItem} from "./AttachImageMenuItem";
import {ShowAttachedFilesMenuItem} from "./ShowAttachedFiledMenuItem";
import {AttachAudioMenuItem} from "./AttachAudioMenuItem";
import {AttachFileMenuItem} from "./AttachFileMenuItem";
import {useLocalization, useStore} from "../../store";

interface AttachFilesButtonProps {
    className?: string
}

const useStyles = makeStyles(() => createStyles({
    attachFileButton: {
        padding: 0,
        textTransform: "none",
        "&:hover": {
            backgroundColor: "unset"
        }
    }
}))

export const AttachFilesButton: FunctionComponent<AttachFilesButtonProps> = observer(({
    className
}) => {
    const {
        messageUploads: {
            uploadedAttachmentsCount,
            uploadPending,
            messageAttachmentsFiles,
            fileValidationErrors,
            setFileValidationErrors
        }
    } = useStore();
    const {l} = useLocalization();
    const attachFileMenuPopupState = usePopupState({
        variant: "popover",
        popupId: "attachFileMenu"
    });
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (fileValidationErrors.length !== 0) {
                fileValidationErrors.forEach(validationError => enqueueSnackbar(l(validationError.label, validationError.bindings), {
                    variant: "error"
                }));
                setFileValidationErrors([]);
            }
        },
        [fileValidationErrors]
    );

    return (
        <Fragment>
            <IconButton
                className={className}
                {...bindToggle(attachFileMenuPopupState)}
                size="large">
                <Badge badgeContent={uploadPending && <CircularProgress size={14} color="primary"/>}
                       anchorOrigin={{
                           vertical: "bottom",
                           horizontal: "right"
                       }}
                >
                    <Badge badgeContent={uploadedAttachmentsCount}
                           color="primary"
                    >
                        <AttachFile/>
                    </Badge>
                </Badge>
            </IconButton>
            <Menu {...bindMenu(attachFileMenuPopupState)}
                keepMounted
            >
                <AttachImageMenuItem onClick={attachFileMenuPopupState.close}
                                     buttonClassName={classes.attachFileButton}
                />
                <MenuItem component="button"
                          disabled
                >
                    <ListItemIcon>
                        <VideoLibrary/>
                    </ListItemIcon>
                    <ListItemText>
                        {l("file.video")}
                    </ListItemText>
                </MenuItem>
                <AttachAudioMenuItem onClick={attachFileMenuPopupState.close}
                                     buttonClassName={classes.attachFileButton}
                />
                <AttachFileMenuItem onClick={attachFileMenuPopupState.close}
                                    buttonClassName={classes.attachFileButton}
                />
                {messageAttachmentsFiles.length !== 0 && (
                    <Fragment>
                        <Divider/>
                        <ShowAttachedFilesMenuItem onClick={attachFileMenuPopupState.close}/>
                    </Fragment>
                )}
            </Menu>
        </Fragment>
    );
})
