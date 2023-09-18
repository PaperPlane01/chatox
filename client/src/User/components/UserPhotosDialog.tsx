import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogTitle} from "@mui/material";
import {UserPhotosGallery} from "./UserPhotosGallery";
import {UserPhotosActions} from "./UserPhotosActions";
import {useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const UserPhotosDialog: FunctionComponent = observer(() => {
    const {
        userProfilePhotosGallery: {
            galleryOpen,
            setGalleryOpen
        },
        selectedUserPhotos: {
            clearSelection
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();

    const handleClose = (): void => {
        setGalleryOpen(false);
        clearSelection();
    };

    return (
        <Dialog open={galleryOpen}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
        >
            <DialogTitle>
                <UserPhotosActions onClose={handleClose}/>
            </DialogTitle>
            <DialogContent>
                <UserPhotosGallery/>
            </DialogContent>
        </Dialog>
    );
});