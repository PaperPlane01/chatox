import {action, observable, reaction} from "mobx";
import _ from "lodash";
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
import {countMotUndefinedValues} from "../../utils/object-utils";
import {ChatOfCurrentUser} from "../../api/types/response/ChatOfCurrentUser";
import {ChatsStore} from "./ChatsStore";
import {ChatsOfCurrentUserStore} from "./ChatsOfCurrentUserStore";
import {EntitiesStore} from "../../entities-store";

export class CreateChatStore {
    @observable
    createChatForm: CreateChatFormData = {
        description: "",
        name: "",
        slug: undefined,
        tags: []
    };

    @observable
    currentTag: string = "";

    @observable
    formErrors: FormErrors<CreateChatFormData> & TagErrorsMapContainer = {
        description: undefined,
        name: undefined,
        slug: undefined,
        tags: undefined,
        tagErrorsMap: {}
    };

    @observable
    createdChat?: ChatOfCurrentUser = undefined;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    pending: boolean = false;

    @observable
    checkingSlugAvailability: boolean = false;

    @observable
    createChatDialogOpen: boolean = false;

    constructor(private readonly entities: EntitiesStore) {
        this.checkSlugAvailability = _.throttle(this.checkSlugAvailability, 300);

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

    @action
    setFormValue = <Key extends keyof CreateChatFormData>(key: Key, value: CreateChatFormData[Key]): void => {
        this.createChatForm[key] = value;
    };

    @action
    setCreateChatDialogOpen = (createChatDialogOpen: boolean) => {
        this.createChatDialogOpen = createChatDialogOpen;
    };

    @action
    setCurrentTag = (currentTag: string): void => {
        this.currentTag = currentTag;
    };

    @action
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

    @action
    removeTagByIndex = (index: number) => {
        this.createChatForm.tags = this.createChatForm.tags.filter((tag, tagIndex) => tagIndex !== index);
    };

    @action
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
                    .then(({data}) => {
                        this.createdChat = data;
                        console.log(data);
                        this.entities.insertChat(data);
                    })
                    .catch(error => {
                        this.submissionError = getInitialApiErrorFromResponse(error);
                    })
                    .finally(() => this.pending = false)
            }
        })
    };

    @action
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
                countMotUndefinedValues(tagErrorsMap) !== 0
            ))
        })
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
    }
}
