import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {UserPhotosGallery} from "./UserPhotosGallery";
import {useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const UserPhotosDialog: FunctionComponent = observer(() => {
    const {
        userProfilePhotosGallery: {
            galleryOpen,
            setGalleryOpen
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
        >
            <DialogTitle>
                <IconButton onClick={() => setGalleryOpen(false)}
                            style={{float: "right"}}
                >
                    <Close/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <UserPhotosGallery/>
            </DialogContent>
        </Dialog>
    );
});