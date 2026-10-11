import {action, makeObservable} from "mobx";
import {EmojiData} from "emoji-mart";
import {AbstractChatFeatureFormStore} from "./AbstractChatFeatureFormStore";
import {ConvertableChatFeatureFormStore} from "./ConvertableChatFeatureFormStore";
import {AddReactionsFeatureFormData} from "../types";
import {ChatFeatures, fromEmojiData, toEmojiData} from "../../api/types/response";
import type {EntitiesStore} from "../../entities-store";
import {FormErrors} from "../../utils/types";
import {createWithUndefinedValues} from "../../utils/object-utils";

const INITIAL_FORM_VALUES: AddReactionsFeatureFormData = {
    enabled: true,
    allowedEmojis: []
};
const INITIAL_FORM_ERRORS: FormErrors<AddReactionsFeatureFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class AddReactionsFeatureFormStore extends AbstractChatFeatureFormStore<AddReactionsFeatureFormData>
    implements ConvertableChatFeatureFormStore<"addReactions"> {

    constructor(private readonly entities: EntitiesStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable(this, {
            addEmoji: action.bound,
            removeEmojiByIndex: action.bound,
            populateFromRole: action.bound
        });
    }

    addEmoji(emoji: EmojiData): void {
        this.formValues.allowedEmojis.push(emoji);
    }

    removeEmojiByIndex(index: number): void {
        this.formValues.allowedEmojis = this.formValues.allowedEmojis.filter((_, currentIndex) => currentIndex !== index);
    }

    populateFromRole(roleId: string): void {
        const chatRole = this.entities.chatRoles.findById(roleId);
        this.setForm({
            enabled: chatRole.features.addReactions.enabled,
            allowedEmojis: chatRole.features.addReactions.additional.allowedEmojis.map(emoji => toEmojiData(emoji))
        });
    }

    convertToApiRequest(): ChatFeatures["addReactions"] {
        return {
            enabled: this.formValues.enabled,
            additional: {
                allowedEmojis: [...new Set(this.formValues.allowedEmojis.map(emoji => fromEmojiData(emoji)))]
            }
        };
    }

}