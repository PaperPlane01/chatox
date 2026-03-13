import React, {Fragment, FunctionComponent, ReactNode, useEffect} from "react";
import {observer} from "mobx-react";
import {Badge, CircularProgress, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import {AttachFile, VideoLibrary} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {useSnackbar} from "notistack";
import {AttachImageMenuItem} from "./AttachImageMenuItem";
import {ShowAttachedFilesMenuItem} from "./ShowAttachedFiledMenuItem";
import {AttachAudioMenuItem} from "./AttachAudioMenuItem";
import {AttachFileMenuItem} from "./AttachFileMenuItem";
import {useLocalization, usePermissions, useStore} from "../../store";
import {createAttachFileButtonStyles} from "../../style";
import {isDefined} from "../../utils/object-utils";

interface AttachFilesButtonProps {
    className?: string
}

const useStyles = createAttachFileButtonStyles();

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
        },
        chat: {
            selectedChatId
        }
    } = useStore();
    const {l} = useLocalization();
    const attachFileMenuPopupState = usePopupState({
        variant: "popover",
        popupId: "attachFileMenu"
    });
    const {classes} = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const {
        messages: {
            canSendImages,
            canSendAudios,
            canSendVideos,
            canSendFiles
        }
    } = usePermissions();

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

    if (!isDefined(selectedChatId)) {
        return null;
    }

    const menuItems: ReactNode[] = [];

    if (canSendImages(selectedChatId)) {
        menuItems.push(
            <AttachImageMenuItem onClick={attachFileMenuPopupState.close}
                                 buttonClassName={classes.attachFileButton}
            />
        );
    }

    if (canSendVideos(selectedChatId)) {
        menuItems.push(
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
        );
    }

    if (canSendAudios(selectedChatId)) {
        menuItems.push(
            <AttachAudioMenuItem onClick={attachFileMenuPopupState.close}
                                 buttonClassName={classes.attachFileButton}
            />
        );
    }

    if (canSendFiles(selectedChatId)) {
        menuItems.push(
            <AttachFileMenuItem onClick={attachFileMenuPopupState.close}
                                buttonClassName={classes.attachFileButton}
            />
        );
    }

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <Fragment>
            <IconButton className={className}
                        size="large"
                        {...bindToggle(attachFileMenuPopupState)}
            >
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
                {menuItems}
                {messageAttachmentsFiles.length !== 0 && (
                    <Fragment>
                        <Divider/>
                        <ShowAttachedFilesMenuItem onClick={attachFileMenuPopupState.close}/>
                    </Fragment>
                )}
            </Menu>
        </Fragment>
    );
});
