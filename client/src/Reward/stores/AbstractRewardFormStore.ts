import {action, makeObservable, reaction} from "mobx";
import {AxiosPromise} from "axios";
import {RewardFormData} from "../types";
import {
    validateMaxRewardValue,
    validateMinRewardValue,
    validatePeriodEnd,
    validatePeriodStart,
    validateRecurringPeriodUnit,
    validateRecurringPeriodValue
} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {EntitiesStore} from "../../entities-store";
import {Currency, Reward} from "../../api/types/response";
import {getInitialApiErrorFromResponse} from "../../api";
import {RewardRequest} from "../../api/types/request";
import {FormErrors} from "../../utils/types";
import {containsNotUndefinedValues, createWithUndefinedValues, isDefined} from "../../utils/object-utils";
import {isStringEmpty} from "../../utils/string-utils";
import {SnackbarService} from "../../Snackbar";
import {Labels, LocaleStore} from "../../localization";
import {SelectUserStore} from "../../UserSelect";

const INITIAL_FORM_VALUES: RewardFormData = {
    active: true,
    currency: Currency.COIN,
    maxRewardValue: "",
    minRewardValue: "",
    periodEnd: undefined,
    periodStart: undefined,
    recurringPeriodUnit: undefined,
    recurringPeriodValue: "",
    useIntegersOnly: true,
    userId: undefined,
    name: ""
};
const INITIAL_FORM_ERRORS: FormErrors<RewardFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export abstract class AbstractRewardFormStore extends AbstractFormStore<RewardFormData> {
    protected constructor(protected readonly entities: EntitiesStore,
                          protected readonly selectedUser: SelectUserStore,
                          protected readonly localeStore: LocaleStore,
                          protected readonly snackbarService: SnackbarService) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable<AbstractRewardFormStore, "validateForm">(this, {
            validateForm: action,
            submitForm: action
        });

        reaction(
            () => this.formValues.minRewardValue,
            minRewardValue => {
                this.setFormError("minRewardValue", validateMinRewardValue(
                    minRewardValue,
                    this.formValues.maxRewardValue
                ));

                if (!isStringEmpty(this.formValues.maxRewardValue)) {
                    this.setFormError("maxRewardValue", validateMaxRewardValue(
                        this.formValues.maxRewardValue,
                        minRewardValue
                    ));
                }
            }
        );

        reaction(
            () => this.formValues.maxRewardValue,
            maxRewardValue => {
                this.setFormError("maxRewardValue", validateMaxRewardValue(
                    maxRewardValue,
                    this.formValues.minRewardValue
                ));

                if (!isStringEmpty(this.formValues.minRewardValue)) {
                    this.setFormError("minRewardValue", validateMinRewardValue(
                        this.formValues.minRewardValue,
                        maxRewardValue
                    ));
                }
            }
        );

        reaction(
            () => this.formValues.periodStart,
            periodStart => {
                this.setFormError("periodStart", validatePeriodStart(
                    periodStart,
                    this.formValues.periodEnd
                ));

                if (isDefined(this.formValues.periodEnd)) {
                    this.setFormError("periodEnd", validatePeriodEnd(
                        this.formValues.periodEnd,
                        periodStart
                    ));
                }
            }
        );

        reaction(
            () => this.formValues.periodEnd,
            periodEnd => {
                this.setFormError("periodEnd", validatePeriodEnd(
                    periodEnd,
                    this.formValues.periodStart
                ));

                if (isDefined(this.formValues.periodStart)) {
                    this.setFormError("periodStart", validatePeriodStart(
                        this.formValues.periodStart,
                        periodEnd
                    ));
                }
            }
        );

        reaction(
            () => this.formValues.recurringPeriodValue,
            recurringPeriodValue => {
                this.setFormError("recurringPeriodValue", validateRecurringPeriodValue(
                    recurringPeriodValue,
                    this.formValues.recurringPeriodUnit
                ));
            }
        );

        reaction(
            () => this.formValues.recurringPeriodUnit,
            recurringPeriodUnit => {
                this.setFormError("recurringPeriodUnit", validateRecurringPeriodUnit(
                    recurringPeriodUnit,
                    this.formValues.recurringPeriodValue
                ));

                if (isDefined(recurringPeriodUnit)) {
                    this.setFormError("recurringPeriodValue", validateRecurringPeriodValue(
                        this.formValues.recurringPeriodValue,
                        this.formValues.recurringPeriodUnit
                    ));
                }
            }
        );

        reaction(
            () => this.selectedUser.selectedUser,
            user => {
                if (user) {
                    this.setFormValue("userId", user.id);
                } else {
                    this.setFormValue("userId", undefined);
                }
            }
        );
    }

    submitForm = (): void => {
        if (!this.validateForm()) {
            return;
        }

        this.setPending(false);
        this.setError(undefined);

        const request = this.convertFormToApiRequest();
        const submit = this.getSubmitFunction();

        submit(request)
            .then(({data}) => {
                this.entities.rewards.insert(data);
                this.afterSubmit();
                this.resetForm();
                this.showSuccessLabel();
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    protected validateForm(): boolean {
        this.setFormErrors({
            ...this.formErrors,
            minRewardValue: validateMinRewardValue(
                this.formValues.minRewardValue,
                this.formValues.maxRewardValue
            ),
            maxRewardValue: validateMaxRewardValue(
                this.formValues.maxRewardValue,
                this.formValues.minRewardValue
            ),
            periodStart: validatePeriodStart(
                this.formValues.periodStart,
                this.formValues.periodEnd
            ),
            periodEnd: validatePeriodEnd(
                this.formValues.periodEnd,
                this.formValues.periodStart
            ),
            recurringPeriodValue: validateRecurringPeriodValue(
                this.formValues.recurringPeriodValue,
                this.formValues.recurringPeriodUnit
            ),
            recurringPeriodUnit: validateRecurringPeriodUnit(
                this.formValues.recurringPeriodUnit,
                this.formValues.recurringPeriodValue
            )
        });

        return !containsNotUndefinedValues(this.formErrors);
    }

    protected convertFormToApiRequest = (): RewardRequest => {
        return {
            minRewardValue: Number(this.formValues.minRewardValue),
            maxRewardValue: Number(this.formValues.maxRewardValue),
            periodStart: this.formValues.periodStart?.toISOString(),
            periodEnd: this.formValues.periodStart?.toISOString(),
            recurringPeriodValue: !isStringEmpty(this.formValues.recurringPeriodValue)
                ? Number(this.formValues.recurringPeriodValue)
                : undefined,
            recurringPeriodUnit: this.formValues.recurringPeriodUnit,
            currency: this.formValues.currency,
            useIntegersOnly: this.formValues.useIntegersOnly,
            active: this.formValues.active,
            userId: this.formValues.userId,
            name: !isStringEmpty(this.formValues.name)
                ? this.formValues.name
                : undefined
        };
    }

    protected abstract getSubmitFunction(): <R extends RewardRequest>(request: R) => AxiosPromise<Reward>;

    protected afterSubmit(): void {};

    protected showSuccessLabel = (): void => {
        this.snackbarService.enqueueSnackbar(this.localeStore.currentLanguageLabels[this.getSuccessLabel()]);
    }

    protected abstract getSuccessLabel(): keyof Labels;
}