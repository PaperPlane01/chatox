import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {AvatarUpload} from "../../Upload";
import {getAvatarLabel} from "../utils";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";

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
        chatAvatarUpload: {
            uploadFile,
            imageContainer: avatarContainer,
            pending,
            validationError,
            submissionError
        }
    } = useStore();
    const classes = useStyles();

    const chat = useEntityById("chats", selectedChatId);

    if (!chat) {
        return null;
    }

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
                          width="100%"
                          height={160}
            />
        </div>
    );
});
