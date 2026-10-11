import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
import {DefaultChatFeature} from "./DefaultChatFeature";
import {useLocalization} from "../../store/hooks";
import {AddReactionsFeatureData} from "../../api/types/response";
import {useSelectedEmojiSet} from "../../Emoji/hooks";

interface AddReactionsChatFeatureProps {
    feature: AddReactionsFeatureData
}

export const AddReactionsChatFeature: FunctionComponent<AddReactionsChatFeatureProps> = observer(({
    feature
}) => {
    const {l} = useLocalization();
    const emojiSet = useSelectedEmojiSet();

    return (
        <Fragment>
            <DefaultChatFeature name={l("chat.feature.add-reactions")} feature={feature}/>
            {feature.additional.allowedEmojis.length === 0
                ? <Typography>{l("chat.features.add-reactions.allowed-emojis.all")}</Typography>
                : (
                    <Fragment>
                        <Typography>{l("chat.features.add-reactions.allowed-emojis")}</Typography>
                        {feature.additional.allowedEmojis.map(emoji => (
                            <em-emoji
                                key={emoji.id}
                                size="16"
                                id={emoji.id}
                                set={emojiSet}
                            />
                        ))}
                    </Fragment>
                )
            }
        </Fragment>
    );
});
