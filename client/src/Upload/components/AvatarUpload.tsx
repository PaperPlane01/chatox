import React, {ChangeEvent, Fragment, FunctionComponent, useState} from "react";
import {Button, CircularProgress, createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {Image} from "@material-ui/icons";
import {Labels} from "../../localization";
import {ApiError} from "../../api";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ImageUploadMetadata} from "../../api/types/response";
import {Avatar} from "../../Avatar";
import {useLocalization} from "../../store/hooks";

interface AvatarUploadProps {
    onFileAttached: (file: File) => void,
    pending: boolean,
    validationError?: keyof Labels,
    submissionError?: ApiError,
    imageContainer?: UploadedFileContainer<ImageUploadMetadata>,
    defaultAvatarId?: string,
    defaultAvatarLabel: string,
    avatarColor: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    avatarUploadButton: {
        marginTop: theme.spacing(1)
    }
}));

export const AvatarUpload: FunctionComponent<AvatarUploadProps> = ({
    onFileAttached,
    pending,
    validationError,
    submissionError,
    imageContainer,
    defaultAvatarLabel,
    defaultAvatarId,
    avatarColor
}) => {
    const {l} = useLocalization();
    const [value, setValue] = useState("");
    const classes = useStyles();

    const handleFileAttachment = (event: ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files.length !== 0) {
            onFileAttached(event.target.files[0]);
        }
    };

    return (
        <Fragment>
            <Avatar avatarLetter={defaultAvatarLabel}
                    avatarColor={avatarColor}
                    avatarId={defaultAvatarId}
                    avatarUri={imageContainer && imageContainer.url}
                    width={80}
                    height={80}
            />
            <Button variant="outlined"
                    color="primary"
                    disabled={pending}
                    component="label"
                    className={classes.avatarUploadButton}
            >
                {pending && <CircularProgress color="primary" size={25}/>}
                {!pending && <Image/>}
                {l("chat.avatar.upload")}
                <input type="file"
                       value={value}
                       style={{display: "none"}}
                       accept="image/png, image/jpg, image/jpeg"
                       onClick={() => setValue("")}
                       onChange={handleFileAttachment}
                />
            </Button>
            {validationError && (
                <Typography variant="body1"
                            style={{color: "red"}}
                >
                    {l(validationError)}
                </Typography>
            )}
        </Fragment>
    )
};
