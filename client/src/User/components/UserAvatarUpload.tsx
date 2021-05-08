import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@material-ui/core";
import randomColor from "randomcolor";
import {getUserAvatarLabel} from "../utils/get-user-avatar-label";
import {AvatarUpload} from "../../Upload";
import {useAuthorization, useStore} from "../../store";

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
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
    const classes = useStyles();

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
