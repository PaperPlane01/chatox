import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {DefaultChatFeatureForm} from "./DefaultChatFeatureForm";
import {useStore, useLocalization} from "../../store";
import {EmojiChipInput} from "../../EmojisChipInput/components";

export const AddReactionsChatFeatureForm: FunctionComponent = observer(() => {
    const {
        chatFeaturesForm: {
            featuresForms: {
                addReactions: {
                    formValues,
                    setFormValue,
                    addEmoji,
                    removeEmojiByIndex
                }
            }
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <DefaultChatFeatureForm
                formValues={formValues}
                name={l("chat.feature.add-reactions")}
                setFormValue={setFormValue}
            />
            <EmojiChipInput
                value={formValues.allowedEmojis}
                label={l("chat.features.add-reactions.allowed-emojis")}
                onEmojiPicked={addEmoji}
                onDelete={removeEmojiByIndex}
            />
        </Fragment>
    );
});
