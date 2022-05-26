import React, {ChangeEvent, Fragment, FunctionComponent, useState} from "react";
import {Button, CircularProgress, createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {Image} from "@material-ui/icons";
import {ApiError} from "../../api";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ImageUploadMetadata} from "../../api/types/response";
import {Avatar, AvatarProps} from "../../Avatar";
import {PartialBy} from "../../utils/types";

interface ImageUploadProps {
    onFileAttached: (file: File) => void,
    pending: boolean,
    validationError?: string,
    submissionError?: ApiError,
    imageContainer?: UploadedFileContainer<ImageUploadMetadata>,
    avatarProps: PartialBy<AvatarProps, "avatarColor" | "avatarLetter">,
    uploadButtonLabel: string,
    accept?: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    avatarUploadButton: {
        marginTop: theme.spacing(1)
    }
}));

export const ImageUpload: FunctionComponent<ImageUploadProps> = ({
    onFileAttached,
    pending,
    validationError,
    submissionError,
    avatarProps,
    uploadButtonLabel,
    accept = "image/png, image/jpg, image/jpeg"
}) => {
    const [value, setValue] = useState("");
    const classes = useStyles();

    const handleFileAttachment = (event: ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files && event.target.files.length !== 0) {
            onFileAttached(event.target.files[0]);
        }
    };

    return (
        <Fragment>
            {avatarProps.avatarUri
                ? <Avatar avatarLetter="" avatarColor="" {...avatarProps}/>
                : (avatarProps.avatarColor && avatarProps.avatarLetter)
                    ? <Avatar avatarLetter={avatarProps.avatarLetter} avatarColor={avatarProps.avatarColor} {...avatarProps}/>
                    : <Fragment/>
            }
            <Button variant="outlined"
                    color="primary"
                    disabled={pending}
                    component="label"
                    className={classes.avatarUploadButton}
            >
                {pending && <CircularProgress color="primary" size={25}/>}
                {!pending && <Image/>}
                {uploadButtonLabel}
                <input type="file"
                       value={value}
                       style={{display: "none"}}
                       accept={accept}
                       onClick={() => setValue("")}
                       onChange={handleFileAttachment}
                />
            </Button>
            {validationError && (
                <Typography variant="body1"
                            style={{color: "red"}}
                >
                    {validationError}
                </Typography>
            )}
        </Fragment>
    )
};