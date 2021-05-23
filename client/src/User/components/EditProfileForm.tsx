import React, {FunctionComponent, useEffect, Fragment} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    InputAdornment,
    TextField, Typography
} from "@material-ui/core";
import {DatePicker} from "@material-ui/pickers";
import {useSnackbar} from "notistack";
import {UserAvatarUpload} from "./UserAvatarUpload";
import {MarkdownPreviewDialog, OpenMarkdownPreviewDialogButton} from "../../Markdown";
import {useLocalization, useStore} from "../../store";
import {getGlobalBanLabel} from "../../GlobalBan/utils";

interface EditProfileFormProps {
    hideHeader?: boolean
}

export const EditProfileForm: FunctionComponent<EditProfileFormProps> = observer(({
    hideHeader = false
}) => {
    const {
        editProfile: {
            editProfileForm,
            formErrors,
            pending,
            error,
            checkingSlugAvailability,
            avatarUploadPending,
            showSnackbar,
            setFormValue,
            setShowSnackbar,
            updateProfile
        },
        entities: {
            globalBans: {
                findById: findGlobalBan
            },
            users: {
                findById: findUser
            }
        },
        authorization: {
            currentUser,
            isCurrentUserBannedGlobally
        }
    } = useStore();
    const {l, dateFnsLocale} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(() => {
        if (showSnackbar) {
            enqueueSnackbar(l("user.edit-profile.success"));
            setShowSnackbar(false);
        }
    }, [showSnackbar]);

    if (!currentUser) {
        return null;
    }

    if (isCurrentUserBannedGlobally()) {
        return (
            <Fragment>
                <Typography>
                    {l("user.edit-profile.cannot-edit-profile")}
                </Typography>
                <br/>
                <Typography>
                    {

                        getGlobalBanLabel(
                            findGlobalBan(currentUser.globalBan!.id),
                            l,
                            dateFnsLocale,
                            findUser
                        )
                    }
                </Typography>
            </Fragment>
        )
    }

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
});
