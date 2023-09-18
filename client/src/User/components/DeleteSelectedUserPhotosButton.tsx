import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const DeleteSelectedUserPhotosButton: FunctionComponent = observer(() => {
    const {
        deleteSelectedUserPhotos: {
            deleteSelectedPhotos,
            pending
        }
    } = useStore();
    const {l} = useLocalization();

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
            {l("common.delete")}
        </Button>
    );
});