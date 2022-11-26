import {action, computed, observable, reaction} from "mobx";
import {throttle} from "lodash";
import {ChatStore} from "./ChatStore";
import {TagErrorsMapContainer, UpdateChatFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {UploadImageStore} from "../../Upload";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ImageUploadMetadata} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {Labels} from "../../localization/types";
import {
    validateChatDescription,
    validateChatName,
    validateChatSlug,
    validateChatTag,
    validateChatTags
} from "../validation";
import {ChatApi} from "../../api/clients";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {ApiError, getInitialApiErrorFromResponse} from "../../api";

export class UpdateChatStore {
    @observable
    updateChatForm: UpdateChatFormData = {
        description: undefined,
        name: "",
        slug: undefined,
        tags: []
    };

    @observable
    formErrors: FormErrors<UpdateChatFormData> & TagErrorsMapContainer = {
        description: undefined,
        tags: undefined,
        name: undefined,
        slug: undefined,
        tagErrorsMap: {}
    };

    @observable
    updateChatDialogOpen: boolean = false;

    @observable
    checkingSlugAvailability: boolean = false;

    @observable
    pending: boolean = false;

    @observable
    error?: ApiError = undefined;

    @observable
    showSnackbar: boolean = false;

    @computed
    get avatarFileContainer(): UploadedFileContainer<ImageUploadMetadata> | undefined {
        return this.uploadChatAvatarStore.imageContainer
    }

    @computed
    get avatarValidationError(): keyof Labels | undefined {
        return this.uploadChatAvatarStore.validationError;
    }

    @computed
    get avatarUploadPending(): boolean {
        return this.uploadChatAvatarStore.pending;
    }

    @computed
    get selectedChat(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    @computed
    get currentChatSlug(): string | undefined {
        if (this.selectedChat) {
            return this.entities.chats.findById(this.selectedChat).slug;
        } else {
            return undefined;
        }
    }

    @computed
    get uploadedAvatarId(): string | undefined {
        return this.avatarFileContainer && this.avatarFileContainer.uploadedFile
            && this.avatarFileContainer.uploadedFile.id
    }

    constructor(private readonly uploadChatAvatarStore: UploadImageStore,
                private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore) {
        this.checkSlugAvailability = throttle(this.checkSlugAvailability, 300);

        reaction(
            () => this.selectedChat,
            selectedChat => {
                if (selectedChat) {
                    const chat = entities.chats.findById(selectedChat);
                    this.updateChatForm = {
                        name: chat.name,
                        description: chat.description,
                        slug: chat.slug,
                        tags: chat.tags
                    }
                }
            }
        );

        reaction(
            () => this.updateChatForm.name,
            name => this.formErrors.name = validateChatName(name)
        );

        reaction(
            () => this.updateChatForm.slug,
            slug => {
                if (this.updateChatDialogOpen && slug !== this.currentChatSlug && slug !== this.selectedChat) {
                    this.formErrors.slug = validateChatSlug(slug);

                    if (!this.formErrors.slug) {
                        this.checkSlugAvailability(slug!);
                    }
                }
            }
        );

        reaction(
            () => this.updateChatForm.description,
            description => this.formErrors.description = validateChatDescription(description)
        );
    }

    @action
    setFormValue = <Key extends keyof UpdateChatFormData>(key: Key, value: UpdateChatFormData[Key]) => {
        this.updateChatForm[key] = value;
    };

    @action
    setUpdateChatDialogOpen = (updateChatDialogOpen: boolean): void => {
        this.updateChatDialogOpen = updateChatDialogOpen;
    };

    @action
    checkSlugAvailability = (slug: string): void => {
        this.checkingSlugAvailability = true;

        ChatApi.checkChatSlugAvailability(slug)
            .then(({data}) => {
                if (!data.available) {
                    this.formErrors.slug = "chat.slug.has-already-been-taken";
                }
            })
            .finally(() => this.checkingSlugAvailability = false);
    };

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };

    @action
    updateChat = (): void => {
        const chatId = this.selectedChat;

        if (!chatId) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        ChatApi.updateChat(chatId, {
            description: this.updateChatForm.description,
            avatarId: this.uploadedAvatarId,
            name: this.updateChatForm.name,
            slug: this.updateChatForm.slug,
            tags: this.updateChatForm.tags
        })
            .then(({data}) => {
                this.entities.chats.insert(data);
                this.setUpdateChatDialogOpen(false);
                this.setShowSnackbar(true);
            })
            .catch(error => this.error = getInitialApiErrorFromResponse(error))
            .finally(() => this.pending = false)
    };

    @action
    validateForm = (): boolean => {
        let slugError = this.formErrors.slug;

        if (slugError !== "chat.slug.has-already-been-taken"
            && this.updateChatForm.slug !== this.currentChatSlug
            && this.updateChatForm.slug !== this.selectedChat) {
            slugError = validateChatSlug(this.updateChatForm.slug);
        }

        this.formErrors = {
            ...this.formErrors,
            name: validateChatName(this.updateChatForm.name),
            description: validateChatDescription(this.updateChatForm.description),
            slug: slugError,
            tags: validateChatTags(this.updateChatForm.tags)
        };
        this.updateChatForm.tags.forEach(tag => {
            this.formErrors.tagErrorsMap[tag] = validateChatTag(tag)
        });

        const {description, name, slug, tagErrorsMap, tags} = this.formErrors;

        return !Boolean(
            description ||
            name ||
            slug ||
            tags ||
            containsNotUndefinedValues(tagErrorsMap) ||
            this.avatarValidationError
        )
    }
}
