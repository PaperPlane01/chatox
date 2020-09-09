import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    createStyles,
    Badge,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    makeStyles,
    Menu,
    MenuItem
} from "@material-ui/core";
import {AttachFile, Audiotrack, FileCopy, VideoLibrary} from "@material-ui/icons";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {useLocalization, useStore} from "../../store/hooks";
import {AttachImageMenuItem} from "./AttachImageMenuItem";
import {ShowAttachedFilesMenuItem} from "./ShowAttachedFiledMenuItem";

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
            uploadedAttachmentsCount
        }
    } = useStore();
    const {l} = useLocalization();
    const attachFileMenuPopupState = usePopupState({
        variant: "popover",
        popupId: "attachFileMenu"
    });
    const classes = useStyles();

    return (
        <Fragment>
            <IconButton className={className}
                        {...bindToggle(attachFileMenuPopupState)}
            >
                <Badge badgeContent={uploadedAttachmentsCount}
                       color="primary"
                >
                    <AttachFile/>
                </Badge>
            </IconButton>
            <Menu {...bindMenu(attachFileMenuPopupState)}
                keepMounted
            >
                <AttachImageMenuItem onClick={attachFileMenuPopupState.close}
                                     buttonClassName={classes.attachFileButton}
                />
                <MenuItem button
                          disabled
                >
                    <ListItemIcon>
                        <VideoLibrary/>
                    </ListItemIcon>
                    <ListItemText>
                        {l("file.video")}
                    </ListItemText>
                </MenuItem>
                <MenuItem button
                          disabled
                >
                    <ListItemIcon>
                        <Audiotrack/>
                    </ListItemIcon>
                    <ListItemText>
                        {l("file.audio")}
                    </ListItemText>
                </MenuItem>
                <MenuItem button
                          disabled
                >
                    <ListItemIcon>
                        <FileCopy/>
                    </ListItemIcon>
                    <ListItemText>
                        {l("file.file")}
                    </ListItemText>
                </MenuItem>
                <Divider/>
                <ShowAttachedFilesMenuItem onClick={attachFileMenuPopupState.close}/>
            </Menu>
        </Fragment>
    )
})
