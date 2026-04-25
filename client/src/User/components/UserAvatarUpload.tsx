import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {makeStyles} from "tss-react/mui";
import randomColor from "randomcolor";
import {getUserAvatarLabel} from "../utils/labels";
import {AvatarUpload} from "../../Upload";
import {useAuthorization, useStore} from "../../store";
import {commonStyles} from "../../style";

const useStyles = makeStyles()(() => ({
    centered: commonStyles.centered
}));

export const UserAvatarUpload: FunctionComponent = observer(() => {
    const {
        userAvatarUpload: {
            uploadFile,
            validationError,
            submissionError,
            pending,
            imageContainer: avatarContainer
        }
    } = useStore();
    const {currentUser} = useAuthorization();
    const {classes} = useStyles();

    if (!currentUser) {
        return null;
    }

    return (
        <div className={classes.centered}>
            <AvatarUpload onFileAttached={uploadFile}
                          pending={pending}
                          imageContainer={avatarContainer}
                          defaultAvatarLabel={getUserAvatarLabel(currentUser)}
                          avatarColor={randomColor({seed: currentUser.id})}
                          validationError={validationError}
                          submissionError={submissionError}
                          defaultAvatarId={currentUser.avatarId}
                          externalAvatarUri={currentUser.externalAvatarUri}
            />
        </div>
    )
});
