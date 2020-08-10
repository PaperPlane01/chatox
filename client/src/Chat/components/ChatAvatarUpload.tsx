import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@material-ui/core";
import randomColor from "randomcolor";
import {AvatarUpload} from "../../Upload";
import {getAvatarLabel} from "../utils";
import {useStore} from "../../store";

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
}));

export const ChatAvatarUpload: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            }
        },
        chatAvatarUpload: {
            uploadFile,
            imageContainer: avatarContainer,
            pending,
            validationError,
            submissionError
        }
    } = useStore();
    const classes = useStyles();

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    return (
        <div className={classes.centered}>
            <AvatarUpload onFileAttached={uploadFile}
                          pending={pending}
                          imageContainer={avatarContainer}
                          defaultAvatarLabel={getAvatarLabel(chat.name)}
                          avatarColor={randomColor({seed: chat.id})}
                          validationError={validationError}
                          submissionError={submissionError}
                          defaultAvatarId={chat.avatarId}
            />
        </div>
    )
});
