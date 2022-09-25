import {action, reaction} from "mobx";
import {AbstractChatFeatureFormStore} from "./AbstractChatFeatureFormStore";
import {validateFromLevel, validateUpToLevel} from "../validation";
import {ChatFeatures, LevelBasedChatFeatureData} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {LevelBasedFeatureFromData} from "../types";
import {FormErrors} from "../../utils/types";
import {ConvertableChatFeatureFormStore} from "./ConvertableChatFeatureFormStore";
import {containsNotUndefinedValues, isDefined} from "../../utils/object-utils";

const INITIAL_FORM_VALUES: LevelBasedFeatureFromData = {
    enabled: false,
    fromLevel: undefined,
    upToLeveL: undefined
}
const INITIAL_FORM_ERRORS: FormErrors<LevelBasedFeatureFromData> = {
    enabled: undefined,
    fromLevel: undefined,
    upToLeveL: undefined
};

export class LevelBasedChatFeatureFromStore
    extends AbstractChatFeatureFormStore<LevelBasedFeatureFromData>
    implements ConvertableChatFeatureFormStore<"deleteOtherUsersMessages" | "assignChatRole" | "kickImmunity" | "blockingImmunity" | "messageDeletionsImmunity"> {

    constructor(private readonly entities: EntitiesStore, private readonly featureName: keyof ChatFeatures) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        reaction(
            () => this.formValues.fromLevel,
            fromLevel => this.setFormError("fromLevel", validateFromLevel(fromLevel))
        );

        reaction(
            () => this.formValues.upToLeveL,
            upToLevel => this.setFormError("upToLeveL", validateUpToLevel(upToLevel, this.formValues.fromLevel))
        );
    }

    @action
    populateFromRole = (roleId: string): void => {
        const role = this.entities.chatRoles.findByIdOptional(roleId);

        if (!role) {
            return;
        }

        const features = role.features[this.featureName] as LevelBasedChatFeatureData;

        this.setForm({
            enabled: role.features[this.featureName].enabled,
            fromLevel: isDefined(features.additional.fromLevel) ? `${features.additional.fromLevel}` : undefined,
            upToLeveL: isDefined(features.additional.upToLevel) ? `${features.additional.upToLevel}` : undefined
        });
    }

    convertToApiRequest(): ChatFeatures["deleteOtherUsersMessages" | "assignChatRole" | "kickImmunity" | "blockingImmunity" | "messageDeletionsImmunity"] {
        return {
            enabled: this.formValues.enabled,
            additional: {
                fromLevel: this.formValues.fromLevel ? Number(this.formValues.fromLevel) : undefined,
                upToLevel: this.formValues.upToLeveL ? Number(this.formValues.upToLeveL) : undefined
            }
        };
    }

    @action
    validateForm = (): boolean => {
        this.setFormErrors({
            enabled: undefined,
            fromLevel: validateFromLevel(this.formValues.fromLevel),
            upToLeveL: validateUpToLevel(this.formValues.upToLeveL, this.formValues.fromLevel)
        });

        return !containsNotUndefinedValues(this.formErrors);
    }
}