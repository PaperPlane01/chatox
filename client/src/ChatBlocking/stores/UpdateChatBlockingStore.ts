import {makeAutoObservable, reaction, runInAction} from "mobx";
import {ChatBlockingEntity, UpdateChatBlockingFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {ApiError, ChatBlockingApi, getInitialApiErrorFromResponse} from "../../api";
import {validateBlockedUntil, validateBlockingDescription} from "../validation";

export class UpdateChatBlockingStore {
    updateChatBlockingForm: UpdateChatBlockingFormData = {
        description: undefined,
        blockedUntil: undefined
    };

    formErrors: FormErrors<UpdateChatBlockingFormData> = {
        description: undefined,
        blockedUntil: undefined
    };

    updateChatBlockingDialogOpen: boolean = false;

    pending: boolean = false;

    submissionError?: ApiError = undefined;

    updatedChatBlocking?: ChatBlockingEntity = undefined;

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

        reaction(
            () => this.updateChatBlockingForm.blockedUntil,
            blockedUntil => this.formErrors.blockedUntil = validateBlockedUntil(blockedUntil)
        );

        reaction(
            () => this.updateChatBlockingForm.description,
            description => validateBlockingDescription(description)
        );
    }

    setChatBlocking = (chatBlockingId: string): void => {
        const chatBlocking = this.entities.chatBlockings.findById(chatBlockingId);
        this.updatedChatBlocking = chatBlocking;

        this.updateChatBlockingForm = {
            blockedUntil: chatBlocking.blockedUntil,
            description: chatBlocking.description
        };
    };

    setUpdateChatBlockingDialogOpen = (updateChatBlockingDialogOpen: boolean): void => {
        this.updateChatBlockingDialogOpen = updateChatBlockingDialogOpen;
    };

    setFormValue = <Key extends keyof UpdateChatBlockingFormData>(key: Key, value: UpdateChatBlockingFormData[Key]): void => {
        this.updateChatBlockingForm[key] = value;
    };

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
    };
}
