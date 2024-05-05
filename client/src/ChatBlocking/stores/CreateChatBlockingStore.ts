import {makeAutoObservable, reaction, runInAction} from "mobx";
import {addHours, subDays, subHours, subMinutes, subYears} from "date-fns";
import {CreateChatBlockingFormData, RecentMessagesDeletionPeriod} from "../types";
import {validateBlockedUntil, validateBlockingDescription} from "../validation";
import {ChatStore} from "../../Chat";
import {ApiError, ChatBlockingApi, getInitialApiErrorFromResponse} from "../../api";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";

// TODO: extend from AbstractFormStore
export class CreateChatBlockingStore {
    createChatBlockingFormData: CreateChatBlockingFormData = {
        blockedUserId: undefined,
        blockedUntil: undefined,
        description: undefined,
        deleteRecentMessages: false,
        recentMessagesDeletionPeriod: RecentMessagesDeletionPeriod.FIVE_MINUTES
    };

    formErrors: FormErrors<CreateChatBlockingFormData> = {
        blockedUntil: undefined,
        description: undefined,
        blockedUserId: undefined,
        deleteRecentMessages: undefined,
        recentMessagesDeletionPeriod: undefined
    };

    createChatBlockingDialogOpen: boolean = false;

    pending: boolean = false;

    submissionError?: ApiError = undefined;

    get chatId(): string | undefined {
        return this.chatStore.selectedChatId;
    }

    constructor(private readonly chatStore: ChatStore,
                private readonly entities: EntitiesStore,
                private readonly snackbarService: SnackbarService,
                private readonly locale: LocaleStore) {
        makeAutoObservable(this);

        reaction(
            () => this.createChatBlockingFormData.description,
            description => this.formErrors.description = validateBlockingDescription(description)
        );

        reaction(
            () => this.createChatBlockingFormData.blockedUntil,
            blockedUntil => this.formErrors.blockedUntil = validateBlockedUntil(blockedUntil)
        );
    }

    setFormValue = <Key extends keyof CreateChatBlockingFormData>(key: Key, value: CreateChatBlockingFormData[Key]): void => {
        this.createChatBlockingFormData[key] = value;
    }

    setCreateChatBlockingDialogOpen = (createChatBlockingDialogOpen: boolean): void => {
        this.createChatBlockingDialogOpen = createChatBlockingDialogOpen;

        if (!this.createChatBlockingFormData.blockedUntil) {
            this.setFormValue("blockedUntil", addHours(new Date(), 1))
        }
    }

    createChatBlocking = (): void => {
        if (this.chatId && this.createChatBlockingFormData.blockedUserId) {
            this.validateForm().then(formValid => {
                if (formValid) {
                    this.pending = true;
                    this.submissionError = undefined;

                    const deleteRecentMessages = this.createChatBlockingFormData.deleteRecentMessages;
                    let deleteMessagesSince: string | undefined = undefined;

                    if (deleteRecentMessages) {
                        deleteMessagesSince = this.getDeleteMessagesSinceDate(
                            this.createChatBlockingFormData.recentMessagesDeletionPeriod
                        ).toISOString();
                    }

                    ChatBlockingApi.createChatBlocking(
                        this.chatId!,
                        {
                            userId: this.createChatBlockingFormData.blockedUserId!,
                            blockedUntil: this.createChatBlockingFormData.blockedUntil!.toISOString(),
                            description: this.createChatBlockingFormData.description,
                            deleteRecentMessages,
                            deleteMessagesSince
                        }
                    )
                        .then(({data}) => {
                            this.entities.chatBlockings.insert(data);
                            this.setCreateChatBlockingDialogOpen(false);
                            this.snackbarService.enqueueSnackbar(
                                this.locale.getCurrentLanguageLabel("chat.blocking.success")
                            );
                            this.resetForm();
                        })
                        .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
                        .finally(() => runInAction(() => this.pending = false));
                }
            })
        }
    }

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
    }

    resetForm = (): void => {
        this.createChatBlockingFormData = {
            description: undefined,
            blockedUntil: undefined,
            blockedUserId: undefined,
            deleteRecentMessages: false,
            recentMessagesDeletionPeriod: RecentMessagesDeletionPeriod.FIVE_MINUTES
        };
        setTimeout(() => {
            this.formErrors = {
                blockedUntil: undefined,
                description: undefined,
                blockedUserId: undefined,
                deleteRecentMessages: undefined,
                recentMessagesDeletionPeriod: undefined
            }
        })
    }

    private getDeleteMessagesSinceDate(period: RecentMessagesDeletionPeriod): Date {
        const now = new Date();

        switch (period) {
            case RecentMessagesDeletionPeriod.FIVE_MINUTES:
                return subMinutes(now, 5);
            case RecentMessagesDeletionPeriod.ONE_HOUR:
                return subHours(now, 1);
            case RecentMessagesDeletionPeriod.ONE_DAY:
                return subDays(now, 1);
            case RecentMessagesDeletionPeriod.ALL_TIME:
                return subYears(now, 70);
            default:
                return subMinutes(now, 5);
        }
    }
}
