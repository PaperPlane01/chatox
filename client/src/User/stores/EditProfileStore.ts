import {makeAutoObservable, reaction, runInAction} from "mobx";
import {throttle} from "lodash";
import {EditProfileFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {validateFirstName, validateLastName, validateSlug} from "../../Registration/validation";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {validateBio} from "../validation";
import {AuthorizationStore} from "../../Authorization";
import {CurrentUser, ImageUploadMetadata} from "../../api/types/response";
import {UploadImageStore} from "../../Upload/stores";
import {UploadedFileContainer} from "../../utils/file-utils";
import {Labels} from "../../localization/types";
import {EntitiesStore} from "../../entities-store";

export class EditProfileStore {
    editProfileForm: EditProfileFormData = {
        firstName: "",
        slug: "",
        bio: "",
        lastName: undefined,
        dateOfBirth: undefined
    };

    formErrors: FormErrors<EditProfileFormData> = {
        firstName: undefined,
        lastName: undefined,
        dateOfBirth: undefined,
        slug: undefined,
        bio: undefined
    };

    pending: boolean = false;

    checkingSlugAvailability: boolean = false;

    showSnackbar: boolean = false;

    error?: ApiError = undefined;

    get currentUser(): CurrentUser | undefined {
        return this.authorizationStore.currentUser;
    }

    get currentUserAvatarId(): string | undefined {
        return this.currentUser && this.currentUser.avatarId;
    }

    get avatarFileContainer(): UploadedFileContainer<ImageUploadMetadata> | undefined {
        return this.uploadUserAvatarStore.imageContainer
    }

    get avatarValidationError(): keyof Labels | undefined {
        return this.uploadUserAvatarStore.validationError;
    }

    get avatarUploadPending(): boolean {
        return this.uploadUserAvatarStore.pending;
    }

    get uploadedAvatarId(): string | undefined {
        return this.avatarFileContainer && this.avatarFileContainer.uploadedFile
            && this.avatarFileContainer.uploadedFile.id
    }

    constructor(private readonly authorizationStore: AuthorizationStore,
                private readonly uploadUserAvatarStore: UploadImageStore,
                private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

        this.checkSlugAvailability = throttle(this.checkSlugAvailability, 300) as () => Promise<void>;

        reaction(
            () => this.currentUser,
            currentUser => {
                if (currentUser) {
                    this.editProfileForm = {
                        firstName: currentUser.firstName,
                        bio: currentUser.bio,
                        lastName: currentUser.lastName,
                        dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth) : undefined,
                        slug: currentUser.slug
                    }
                } else {
                    this.editProfileForm = {
                        firstName: "",
                        slug: "",
                        bio: "",
                        lastName: undefined,
                        dateOfBirth: undefined
                    }
                }
            }
        );

        reaction(
            () => this.editProfileForm.firstName,
            firstName => this.formErrors.firstName = validateFirstName(firstName)
        );

        reaction(
            () => this.editProfileForm.lastName,
            lastName => this.formErrors.lastName = validateLastName(lastName)
        );

        reaction(
            () => this.editProfileForm.bio,
            bio => this.formErrors.bio = validateBio(bio)
        );

        reaction(
            () => this.editProfileForm.slug,
            slug => {
                if (this.currentUser && (slug === this.currentUser.slug || slug === this.currentUser.id)) {
                    this.formErrors.slug = undefined;
                } else {
                    this.formErrors.slug = validateSlug(slug);

                    if (!this.formErrors.slug) {
                        this.checkSlugAvailability();
                    }
                }
            }
        );
    }

    setFormValue = <Key extends keyof EditProfileFormData>(key: Key, value: EditProfileFormData[Key]): void => {
        this.editProfileForm[key] = value;
    };

    updateProfile = (): void => {
        this.validateForm().then(formValid => {
            if (!this.currentUser || !formValid) {
                return;
            }

            this.pending = true;

            UserApi.updateUser(this.currentUser.id, {
                slug: this.editProfileForm.slug,
                bio: this.editProfileForm.bio,
                dateOfBirth: this.editProfileForm.dateOfBirth
                    ? this.editProfileForm.dateOfBirth.toISOString()
                    : undefined,
                firstName: this.editProfileForm.firstName,
                lastName: this.editProfileForm.lastName,
                avatarId: this.uploadedAvatarId ? this.uploadedAvatarId : this.currentUserAvatarId
            })
                .then(({data}) => {
                    if (this.currentUser && this.currentUser.id === data.id) {
                        this.authorizationStore.setCurrentUser({
                            ...this.currentUser,
                            ...data,
                            avatarId: data.avatar && data.avatar.id
                        });
                        this.entities.users.insert(data);
                        this.setShowSnackbar(true);
                    }
                })
                .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
                .finally(() => runInAction(() => this.pending = false));
        })
    };

    checkSlugAvailability = (): Promise<void> => {
        if (!this.editProfileForm.slug || this.editProfileForm.slug.length === 0) {
            return new Promise<void>(resolve => resolve());
        }

        if (this.currentUser && (this.editProfileForm.slug === this.currentUser.slug
            || this.editProfileForm.slug === this.currentUser.id)) {
            return new Promise<void>(resolve => resolve());
        }

        this.checkingSlugAvailability = true;

        return UserApi.isSlugAvailable(this.editProfileForm.slug)
            .then(({data}) => runInAction(() => {
                if (!data.available) {
                    this.formErrors.slug = "slug.has-already-been-taken";
                } else {
                    this.formErrors.slug = undefined;
                }
            }))
            .finally(() => runInAction(() => {
                this.checkingSlugAvailability = false
            }));
    };

    validateForm = (): Promise<boolean> => {
        return new Promise<boolean>(async resolve => {
            let {firstName, lastName, bio, slug, dateOfBirth} = this.formErrors;

            if (Boolean(firstName || lastName || bio || slug || dateOfBirth || this.avatarValidationError)) {
                resolve(false);
            }

            this.checkSlugAvailability()
                .then(() => resolve(!Boolean(this.formErrors.slug)));
        })
    };

    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };
}
