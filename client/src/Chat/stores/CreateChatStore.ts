import {makeAutoObservable, reaction, runInAction} from "mobx";
import {throttle} from "lodash";
import {CreateChatFormData, TagErrorsMapContainer} from "../types";
import {
    validateChatDescription,
    validateChatName,
    validateChatSlug,
    validateChatTag,
    validateChatTags
} from "../validation";
import {ApiError, ChatApi, getInitialApiErrorFromResponse} from "../../api";
import {FormErrors} from "../../utils/types";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {ChatOfCurrentUser} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";

export class CreateChatStore {
    createChatForm: CreateChatFormData = {
        description: "",
        name: "",
        slug: undefined,
        tags: []
    };

    currentTag: string = "";

    formErrors: FormErrors<CreateChatFormData> & TagErrorsMapContainer = {
        description: undefined,
        name: undefined,
        slug: undefined,
        tags: undefined,
        tagErrorsMap: {}
    };

    createdChat?: ChatOfCurrentUser = undefined;

    submissionError?: ApiError = undefined;

    pending: boolean = false;

    checkingSlugAvailability: boolean = false;

    createChatDialogOpen: boolean = false;

    constructor(private readonly entities: EntitiesStore) {
       makeAutoObservable(this);

        this.checkSlugAvailability = throttle(this.checkSlugAvailability, 300);

        reaction(
            () => this.createChatForm.name,
            name => this.formErrors.name = validateChatName(name)
        );

        reaction(
            () => this.createChatForm.slug,
            slug => {
                this.formErrors.slug = validateChatSlug(slug);

                if (!this.formErrors.slug) {
                    this.checkSlugAvailability(slug!);
                }
            }
        );

        reaction(
            () => this.createChatForm.description,
            description => this.formErrors.description = validateChatDescription(description)
        )
    }

    setFormValue = <Key extends keyof CreateChatFormData>(key: Key, value: CreateChatFormData[Key]): void => {
        this.createChatForm[key] = value;
    };

    setCreateChatDialogOpen = (createChatDialogOpen: boolean) => {
        this.createChatDialogOpen = createChatDialogOpen;
    };

    setCurrentTag = (currentTag: string): void => {
        this.currentTag = currentTag;
    };

    addTag = (tag: string) => {
        if (tag.trim().length !== 0) {
            if (this.createChatForm.tags.includes(tag)) {
                const newTags = this.createChatForm.tags.filter(currentTag => currentTag !== tag);
                newTags.push(tag);
                this.createChatForm.tags = newTags;
            } else {
                this.createChatForm.tags.push(tag);
            }
        }
    };

    removeTagByIndex = (index: number) => {
        this.createChatForm.tags = this.createChatForm.tags.filter((tag, tagIndex) => tagIndex !== index);
    };

    createChat = (): void => {
        this.validateForm().then(formValid => {
            if (formValid) {
                this.pending = true;
                this.submissionError = undefined;

                ChatApi.createChat({
                    name: this.createChatForm.name!,
                    description: this.createChatForm.description,
                    slug: this.createChatForm.slug,
                    tags: this.createChatForm.tags || []
                })
                    .then(({data}) => runInAction(() => {
                        this.createdChat = data;
                        this.entities.chats.insert(data);
                    }))
                    .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
                    .finally(() => runInAction(() => this.pending = false))
            }
        })
    };

    validateForm = (): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
            this.formErrors = {
                ...this.formErrors,
                description: validateChatDescription(this.createChatForm.description),
                name: validateChatName(this.createChatForm.name),
                slug: validateChatSlug(this.createChatForm.slug),
                tags: validateChatTags(this.createChatForm.tags)
            };
            this.createChatForm.tags.forEach(tag => {
                this.formErrors.tagErrorsMap[tag] = validateChatTag(tag);
            });

            const {description, name, slug, tagErrorsMap, tags} = this.formErrors;

            resolve(!Boolean(
                description ||
                name ||
                slug ||
                tags ||
                containsNotUndefinedValues(tagErrorsMap)
            ))
        })
    };

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

    reset = (): void => {
        this.createdChat = undefined;
        this.createChatForm = {
            name: "",
            tags: [],
            description: "",
            slug: undefined
        };
        this.pending = false;
        this.createChatDialogOpen = false;
        this.currentTag = "";
        setTimeout(() => {
            this.formErrors = {
                name: undefined,
                tags: undefined,
                slug: undefined,
                description: undefined,
                tagErrorsMap: {}
            };
        })
    };
}
