import {action, computed, observable, reaction} from "mobx";
import {CreateChatBlockingFormData} from "../types";
import {validateBlockedUntil, validateBlockingDescription} from "../validation";
import {ChatStore} from "../../Chat";
import {ApiError, ChatBlockingApi, getInitialApiErrorFromResponse} from "../../api";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {addHours} from "date-fns";

export class CreateChatBlockingStore {
    @observable
    createChatBlockingFormData: CreateChatBlockingFormData = {
        blockedUserId: undefined,
        blockedUntil: undefined,
        description: undefined
    };

    @observable
    formErrors: FormErrors<CreateChatBlockingFormData> = {
        blockedUntil: undefined,
        description: undefined,
        blockedUserId: undefined
    };

    @observable
    createChatBlockingDialogOpen: boolean = false;

    @observable
    pending: boolean = false;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    showSnackbar: boolean = false;

    @computed
    get chatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore) {
        reaction(
            () => this.createChatBlockingFormData.description,
            description => this.formErrors.description = validateBlockingDescription(description)
        );

        reaction(
            () => this.createChatBlockingFormData.blockedUntil,
            blockedUntil => this.formErrors.blockedUntil = validateBlockedUntil(blockedUntil)
        );
    }

    @action
    setFormValue = <Key extends keyof CreateChatBlockingFormData>(key: Key, value: CreateChatBlockingFormData[Key]): void => {
        this.createChatBlockingFormData[key] = value;
    };

    @action
    setCreateChatBlockingDialogOpen = (createChatBlockingDialogOpen: boolean): void => {
        this.createChatBlockingDialogOpen = createChatBlockingDialogOpen;

        if (!this.createChatBlockingFormData.blockedUntil) {
            this.setFormValue("blockedUntil", addHours(new Date(), 1))
        }
    };

    @action
    setShowSnackbar = (showSnackbar: boolean): void => {
        this.showSnackbar = showSnackbar;
    };

    @action
    createChatBlocking = (): void => {
        if (this.chatId && this.createChatBlockingFormData.blockedUserId) {
            this.validateForm().then(formValid => {
                if (formValid) {
                    this.pending = true;
                    this.submissionError = undefined;

                    ChatBlockingApi.createChatBlocking(
                        this.chatId!,
                        {
                            userId: this.createChatBlockingFormData.blockedUserId!,
                            blockedUntil: this.createChatBlockingFormData.blockedUntil!.toISOString(),
                            description: this.createChatBlockingFormData.description
                        }
                    )
                        .then(({data}) => {
                            this.entities.insertChatBlocking(data);
                            this.setCreateChatBlockingDialogOpen(false);
                            this.setShowSnackbar(true);
                            this.resetForm();
                        })
                        .catch(error => this.submissionError = getInitialApiErrorFromResponse(error))
                        .finally(() => this.pending = false);
                }
            })
        }
    };

    @action
    validateForm = (): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
            this.formErrors = {
                ...this.formErrors,
                blockedUserId: undefined,
                description: validateBlockingDescription(this.createChatBlockingFormData.description),
                blockedUntil: validateBlockedUntil(this.createChatBlockingFormData.blockedUntil)
            };

            const {description, blockedUntil} = this.formErrors;

            resolve(!Boolean(description || blockedUntil));
        })
    };

    @action
    resetForm = (): void => {
        this.createChatBlockingFormData = {
            description: undefined,
            blockedUntil: undefined,
            blockedUserId: undefined
        };
        setTimeout(() => {
            this.formErrors = {
                blockedUntil: undefined,
                description: undefined,
                blockedUserId: undefined
            }
        })
    }
}
