import React, {FunctionComponent, useEffect} from "react";
import {inject, observer} from "mobx-react";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    InputAdornment,
    TextField
} from "@material-ui/core";
import {DatePicker} from "@material-ui/pickers";
import {useSnackbar} from "notistack";
import {UserAvatarUpload} from "./UserAvatarUpload";
import {EditProfileFormData} from "../types";
import {MarkdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {localized, Localized} from "../../localization";
import {FormErrors} from "../../utils/types";
import {ApiError} from "../../api";
import {MapMobxToProps} from "../../store";

interface EditProfileFormOwnProps {
    hideHeader?: boolean
}

interface EditProfileFormMobxProps {
    editProfileForm: EditProfileFormData,
    formErrors: FormErrors<EditProfileFormData>,
    pending: boolean,
    error?: ApiError,
    checkingSlugAvailability: boolean,
    avatarUploadPending: boolean,
    showSnackbar: boolean,
    setFormValue: <Key extends keyof EditProfileFormData>(key: Key, value: EditProfileFormData[Key]) => void,
    setShowSnackbar: (showSnackbar: boolean) => void,
    updateProfile: () => void
}

type EditProfileFormProps = EditProfileFormOwnProps & EditProfileFormMobxProps & Localized;

const _EditProfileForm: FunctionComponent<EditProfileFormProps> = ({
    hideHeader = false,
    editProfileForm,
    formErrors,
    pending,
    error,
    checkingSlugAvailability,
    avatarUploadPending,
    showSnackbar,
    setFormValue,
    setShowSnackbar,
    updateProfile,
    l
}) => {
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (showSnackbar) {
            enqueueSnackbar(l("user.edit-profile.success"));
            setShowSnackbar(false);
        }
    }, [showSnackbar]);

    return (
        <Card>
            {!hideHeader && <CardHeader title={l("user.edit-profile")}/>}
            <CardContent>
                <UserAvatarUpload/>
                <TextField label={l("firstName")}
                           value={editProfileForm.firstName}
                           error={Boolean(formErrors.firstName)}
                           helperText={formErrors.firstName && l(formErrors.firstName)}
                           fullWidth
                           margin="dense"
                           onChange={event => setFormValue("firstName", event.target.value)}
                />
                <TextField label={l("lastName")}
                           value={editProfileForm.lastName}
                           error={Boolean(formErrors.lastName)}
                           helperText={formErrors.lastName && l(formErrors.lastName)}
                           fullWidth
                           margin="dense"
                           onChange={event => setFormValue("lastName", event.target.value)}
                />
                <TextField label={l("slug")}
                           value={editProfileForm.slug}
                           error={Boolean(formErrors.slug)}
                           helperText={formErrors.slug && l(formErrors.slug)}
                           fullWidth
                           margin="dense"
                           onChange={event => setFormValue("slug", event.target.value)}
                           InputProps={{
                               endAdornment: checkingSlugAvailability && (
                                   <InputAdornment position="end">
                                       <CircularProgress size={15} color="primary"/>
                                   </InputAdornment>
                               )
                           }}
                />
                <DatePicker label={l("user.profile.birth-date")}
                            value={editProfileForm.dateOfBirth ? editProfileForm.dateOfBirth : null}
                            disableFuture
                            openTo="year"
                            onChange={date => setFormValue("dateOfBirth", date ? date : undefined)}
                            clearable
                            fullWidth
                            format="dd MMMM yyyy"
                            autoOk
                />
                <TextField label={l("user.profile.bio")}
                           value={editProfileForm.bio}
                           error={Boolean(formErrors.bio)}
                           helperText={formErrors.bio && l(formErrors.bio)}
                           fullWidth
                           margin="dense"
                           onChange={event => setFormValue("bio", event.target.value)}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <OpenMarkdownPreviewDialogButton/>
                                   </InputAdornment>
                               )
                           }}
                           multiline
                           rows={4}
                           rowsMax={Number.MAX_SAFE_INTEGER}
                />
            </CardContent>
            <CardActions>
                <Button variant="contained"
                        color="primary"
                        disabled={pending || avatarUploadPending || checkingSlugAvailability}
                        onClick={updateProfile}
                >
                    {pending && <CircularProgress size={25} color="primary"/>}
                    {l("user.edit-profile.save-changes")}
                </Button>
            </CardActions>
            <MarkdownPreviewDialog text={editProfileForm.bio || ""}/>
        </Card>
    )
};

const mapMobxToProps: MapMobxToProps<EditProfileFormMobxProps> = ({
    editProfile
}) => ({
    editProfileForm: editProfile.editProfileForm,
    formErrors: editProfile.formErrors,
    pending: editProfile.pending,
    error: editProfile.error,
    checkingSlugAvailability: editProfile.checkingSlugAvailability,
    avatarUploadPending: editProfile.avatarUploadPending,
    showSnackbar: editProfile.showSnackbar,
    setFormValue: editProfile.setFormValue,
    setShowSnackbar: editProfile.setShowSnackbar,
    updateProfile: editProfile.updateProfile
});

export const EditProfileForm = localized(
    inject(mapMobxToProps)(observer(_EditProfileForm))
) as FunctionComponent<EditProfileFormOwnProps>;
