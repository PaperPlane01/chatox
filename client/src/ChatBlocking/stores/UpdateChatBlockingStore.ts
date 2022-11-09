import {action, observable, reaction, runInAction} from "mobx";
import {ChatBlockingEntity, UpdateChatBlockingFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {EntitiesStoreV2} from "../../entities-store";
import {ApiError, ChatBlockingApi, getInitialApiErrorFromResponse} from "../../api";
import {validateBlockedUntil, validateBlockingDescription} from "../validation";

export class UpdateChatBlockingStore {
    @observable
    updateChatBlockingForm: UpdateChatBlockingFormData = {
        description: undefined,
        blockedUntil: undefined
    };

    @observable
    formErrors: FormErrors<UpdateChatBlockingFormData> = {
        description: undefined,
        blockedUntil: undefined
    };

    @observable
    updateChatBlockingDialogOpen: boolean = false;

    @observable
    pending: boolean = false;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    updatedChatBlocking?: ChatBlockingEntity = undefined;

    constructor(private readonly entities: EntitiesStoreV2) {
        reaction(
            () => this.updateChatBlockingForm.blockedUntil,
            blockedUntil => this.formErrors.blockedUntil = validateBlockedUntil(blockedUntil)
        );

        reaction(
            () => this.updateChatBlockingForm.description,
            description => validateBlockingDescription(description)
        );
    }

    @action
    setChatBlocking = (chatBlockingId: string): void => {
        const chatBlocking = this.entities.chatBlockings.findById(chatBlockingId);
        this.updatedChatBlocking = chatBlocking;

        this.updateChatBlockingForm = {
            blockedUntil: chatBlocking.blockedUntil,
            description: chatBlocking.description
        };
    };

    @action
    setUpdateChatBlockingDialogOpen = (updateChatBlockingDialogOpen: boolean): void => {
        this.updateChatBlockingDialogOpen = updateChatBlockingDialogOpen;
    };

    @action
    setFormValue = <Key extends keyof UpdateChatBlockingFormData>(key: Key, value: UpdateChatBlockingFormData[Key]): void => {
        this.updateChatBlockingForm[key] = value;
    };

    @action
    updateChatBlocking = (): void => {
        this.validateForm().then(formValid => {
            if (formValid) {
                this.pending = true;
                this.submissionError = undefined;

                ChatBlockingApi.updateChatBlocking(
                    this.updatedChatBlocking!.chatId,
                    this.updatedChatBlocking!.id,
                    {
                        blockedUntil: this.updateChatBlockingForm!.blockedUntil!.toISOString(),
                        description: this.updateChatBlockingForm!.description
                    }
                )
                    .then(({data}) => {
                        this.entities.chatBlockings.insert(data);
                        this.setUpdateChatBlockingDialogOpen(false);
                        this.updatedChatBlocking = undefined;
                        this.resetForm();
                    })
                    .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
                    .finally(() => runInAction(() => this.pending = false));
            }
        })
    };

    @action
    validateForm = (): Promise<boolean> => {
        return new Promise<boolean>(resolve => {
            this.formErrors = {
                ...this.formErrors,
                description: validateBlockingDescription(this.updateChatBlockingForm.description),
                blockedUntil: validateBlockedUntil(this.updateChatBlockingForm.blockedUntil)
            };

            const {description, blockedUntil} = this.formErrors;

            resolve(!Boolean(description || blockedUntil));
        })
    };

    @action
    resetForm = (): void => {
        this.updateChatBlockingForm = {
            description: undefined,
            blockedUntil: undefined,
        };
        setTimeout(() => {
            this.formErrors = {
                blockedUntil: undefined,
                description: undefined,
            }
        })
    }
}
