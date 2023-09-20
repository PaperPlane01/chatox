import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@mui/material";
import {AccountCircle} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const SetSelectedPhotoAsAvatarButton: FunctionComponent = observer(() => {
    const {
        selectedUserPhotos: {
            selectedPhotosIds
        },
        setPhotoAsAvatar: {
            pending,
            setPhotoId,
            setPhotoAsAvatar
        }
    } = useStore();
    const {l} = useLocalization();

    if (selectedPhotosIds.length === 0) {
        return null;
    }

    const handleClick = (): void => {
        setPhotoId(selectedPhotosIds[0]);
        setPhotoAsAvatar();
    };

    return (
        <Button onClick={handleClick}
                variant="contained"
                color="primary"
                disabled={pending}
        >
            {pending
                ? <CircularProgress color="primary" size={15}/>
                : <AccountCircle/>
            }
            {l("photo.set-as-avatar")}
        </Button>
    );
});
