import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface DeleteSelectedUserPhotosButtonProps {
    showCount?: boolean
}

export const DeleteSelectedUserPhotosButton: FunctionComponent<DeleteSelectedUserPhotosButtonProps> = observer(({
    showCount = false
}) => {
    const {
        deleteSelectedUserPhotos: {
            deleteSelectedPhotos,
            pending
        },
        selectedUserPhotos: {
            selectedPhotosCount
        }
    } = useStore();
    const {l} = useLocalization();
    const label = showCount
        ? l("common.delete.with-count", {count: selectedPhotosCount})
        : l("common.delete");

    return (
        <Button onClick={deleteSelectedPhotos}
                disabled={pending}
                variant="contained"
                color="primary"
        >
            {pending
                ? <CircularProgress size={15} color="primary"/>
                : <Delete/>
            }
            {label}
        </Button>
    );
});