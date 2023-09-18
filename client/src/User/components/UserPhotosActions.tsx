import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {DeleteSelectedUserPhotosButton} from "./DeleteSelectedUserPhotosButton";
import {useEntities, useLocalization, useStore} from "../../store";
import {TranslationFunction} from "../../localization";

interface SelectedUserPhotosActionsProps {
    onClose: () => void
}

const getLabel = (selectedPhotosCount: number, username: string, l: TranslationFunction): string => {
    if (selectedPhotosCount === 0) {
        return l("user.photo.list", {username});
    } else if (selectedPhotosCount === 1) {
        return l("photo.selection.count.singular", {selectedPhotosCount});
    } else {
        return l("photo.selection.count", {selectedPhotosCount});
    }
}

export const UserPhotosActions: FunctionComponent<SelectedUserPhotosActionsProps> = observer(({
    onClose
}) => {
    const {
        selectedUserPhotos: {
            selectedPhotosCount
        },
        userProfile: {
            selectedUserId
        }
    } = useStore();
    const {
        users: {
            findById: findUser
        }
    } = useEntities();
    const {l} = useLocalization();

    if (!selectedUserId) {
        return null;
    }

    const user = findUser(selectedUserId);
    const label = getLabel(selectedPhotosCount, user.firstName, l);

    return (
        <Fragment>
            {label}
            <div style={{float: "right"}}>
                {selectedPhotosCount !== 0 && <DeleteSelectedUserPhotosButton/>}
                <IconButton onClick={onClose}>
                    <Close/>
                </IconButton>
            </div>
        </Fragment>
    );
});
