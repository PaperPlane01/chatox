import {action, computed, makeObservable, observable, reaction, runInAction} from "mobx";
import {throttle} from "lodash";
import {ChatStore} from "./ChatStore";
import {ChatOfCurrentUserEntity, TagErrorsMap, UpdateChatFormData} from "../types";
import {
    validateChatDescription,
    validateChatName, validateChatSlowModeInterval, validateChatSlowModeTimeUnit,
    validateChatSlug,
    validateChatTag,
    validateChatTags
} from "../validation";
import {ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {ImageUploadMetadata, SlowMode} from "../../api/types/response";
import {AbstractFormStore} from "../../form-store";
import {UploadImageStore} from "../../Upload";
import {EntitiesStore} from "../../entities-store";
import {Labels, LocaleStore} from "../../localization";
import {FormErrors} from "../../utils/types";
import {containsNotUndefinedValues, createWithUndefinedValues, isDefined} from "../../utils/object-utils";
import {UploadedFileContainer} from "../../utils/file-utils";
import {SnackbarService} from "../../Snackbar";

const INITIAL_FORM_VALUES: UpdateChatFormData = {
    description: undefined,
    name: "",
    slug: undefined,
    tags: [],
    slowModeEnabled: false
};
const INITIAL_FORM_ERRORS: FormErrors<UpdateChatFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class UpdateChatStore extends AbstractFormStore<UpdateChatFormData> {
    checkingSlugAvailability: boolean = false;

    tagsErrorsMap: TagErrorsMap = {};

    get avatarFileContainer(): UploadedFileContainer<ImageUploadMetadata> | undefined {
        return this.uploadChatAvatarStore.imageContainer
    }

    get avatarValidationError(): keyof Labels | undefined {
        return this.uploadChatAvatarStore.validationError;
    }

    get avatarUploadPending(): boolean {
        return this.uploadChatAvatarStore.pending;
    }

    get selectedChatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    get selectedChat(): ChatOfCurrentUserEntity | undefined {
        if (!this.selectedChatId) {
            return undefined;
        }

        return this.entities.chats.findByIdOptional(this.selectedChatId)
    }

    get currentChatSlug(): string | undefined {
        if (this.selectedChat) {
            return this.selectedChat.slug;
        } else {
            return undefined;
        }
    }

    get uploadedAvatarId(): string | undefined {
        return (this.avatarFileContainer && this.avatarFileContainer.uploadedFile
            && this.avatarFileContainer.uploadedFile.id) || this.selectedChat?.avatarId
    }

    constructor(private readonly uploadChatAvatarStore: UploadImageStore,
                private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        this.checkSlugAvailability = throttle(this.checkSlugAvailability, 300);

        makeObservable<UpdateChatStore, "validateForm">(this, {
            checkingSlugAvailability: observable,
            tagsErrorsMap: observable,
            avatarFileContainer: computed,
            avatarValidationError: computed,
            avatarUploadPending: computed,
            selectedChat: computed,
            currentChatSlug: computed,
            uploadedAvatarId: computed,
            checkSlugAvailability: action,
            submitForm: action,
            validateForm: action
        });

        reaction(
            () => this.selectedChat,
            selectedChat => {
                if (selectedChat) {
                    this.setForm({
                        name: selectedChat.name,
                        description: selectedChat.description,
                        slug: selectedChat.slug,
                        tags: selectedChat.tags,
                        slowModeEnabled: selectedChat.slowMode ? selectedChat.slowMode.enabled : false,
                        slowModeInterval: selectedChat.slowMode?.interval.toString(),
                        slowModeUnit: selectedChat.slowMode?.unit
                    });
                }
            }
        );

        reaction(
            () => this.formValues.name,
            name => this.setFormError("name", validateChatName(name))
        );

        reaction(
            () => this.formValues.slug,
            slug => {
                if (slug !== this.currentChatSlug && slug !== this.selectedChat) {
                    this.setFormError("slug", validateChatSlug(slug));

                    if (!this.formErrors.slug) {
                        this.checkSlugAvailability(slug!);
                    }
                }
            }
        );

        reaction(
            () => this.formValues.description,
            description => this.setFormError("description", validateChatDescription(description))
        );

        reaction(
            () => this.formValues.slowModeInterval,
            interval => validateChatSlowModeInterval(
                interval,
                !this.formValues.slowModeEnabled
            )
        );

        reaction(
            () => this.formValues.slowModeUnit,
            unit => validateChatSlowModeTimeUnit(unit, !this.formValues.slowModeEnabled)
        );
    }

    checkSlugAvailability = (slug: string): void => {
        this.checkingSlugAvailability = true;

        ChatApi.checkChatSlugAvailability(slug)
            .then(({data}) => {
                if (!data.available) {
                    this.setFormError("slug", "chat.slug.has-already-been-taken");
                }
            })
            .finally(() => runInAction(() => this.checkingSlugAvailability = false));
    }

    submitForm = (): void => {
        const chatId = this.selectedChat?.id;

        if (!chatId) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        ChatApi.updateChat(chatId, {
            description: this.formValues.description,
            avatarId: this.uploadedAvatarId,
            name: this.formValues.name,
            slug: this.formValues.slug,
            tags: this.formValues.tags,
            slowMode: this.getSlowModeFromForm()
        })
            .then(({data}) => {
                this.entities.chats.insert(data);
                this.snackbarService.enqueueSnackbar(this.locale.getCurrentLanguageLabel("chat.update.success"));
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    private getSlowModeFromForm = (): SlowMode | undefined => {
        if (this.formValues.slowModeEnabled) {
            return {
                enabled: true,
                unit: this.formValues.slowModeUnit!,
                interval: Number(this.formValues.slowModeInterval!)
            };
        } else if (isDefined(this.formValues.slowModeInterval) && isDefined(this.formValues.slowModeUnit)) {
            return {
                enabled: false,
                unit: this.formValues.slowModeUnit,
                interval: Number(this.formValues.slowModeInterval)
            };
        } else {
            return undefined;
        }
    }

    protected validateForm = (): boolean => {
        let slugError = this.formErrors.slug;

        if (slugError !== "chat.slug.has-already-been-taken"
            && this.formValues.slug !== this.currentChatSlug
            && this.formValues.slug !== this.selectedChat) {
            slugError = validateChatSlug(this.formErrors.slug);
        }

        this.setFormErrors({
            ...this.formErrors,
            name: validateChatName(this.formValues.name),
            description: validateChatDescription(this.formValues.description),
            slug: slugError,
            tags: validateChatTags(this.formValues.tags)
        });
        this.formValues.tags.forEach(tag => {
            this.tagsErrorsMap[tag] = validateChatTag(tag)
        });

        return !containsNotUndefinedValues(this.formErrors)
            && !containsNotUndefinedValues(this.tagsErrorsMap)
            && !Boolean(this.avatarValidationError)
    }
}
