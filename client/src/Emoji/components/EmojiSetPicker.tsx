import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, FormControlLabel, Radio, RadioGroup, Typography} from "@material-ui/core";
import {EmojiSetDemo} from "./EmojiSetDemo";
import {UseEmojiCodesSwitch} from "./UseEmojiCodesSwitch";
import {ExtendedEmojiSet} from "../types";
import {ALLOWED_EMOJI_SETS} from "../internal/constants";
import {useLocalization, useStore} from "../../store/hooks";
import {Labels} from "../../localization/types";

interface EmojiSetPickerProps {
    hideHeader?: boolean
}

export const EmojiSetPicker: FunctionComponent<EmojiSetPickerProps> = observer(({hideHeader = false}) => {
    const {
        emoji: {
            selectedEmojiSet,
            setSelectedEmojiSet
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            {!hideHeader && <CardHeader title={l("emoji.pick-emoji-set")}/>}
            <CardContent>
                <RadioGroup value={selectedEmojiSet}
                            onChange={event => setSelectedEmojiSet(event.target.value as ExtendedEmojiSet)}
                >
                    {ALLOWED_EMOJI_SETS.map(emojiSet => (
                        <FormControlLabel control={<Radio/>}
                                          value={emojiSet}
                                          label={
                                              <Fragment>
                                                  <Typography>
                                                      <strong>{l(`emoji.set.${emojiSet}` as keyof Labels)}</strong>
                                                  </Typography>
                                                  <Typography>
                                                      <EmojiSetDemo set={emojiSet}/>
                                                  </Typography>
                                              </Fragment>
                                          }
                        />
                    ))}
                </RadioGroup>
                <UseEmojiCodesSwitch/>
            </CardContent>
        </Card>
    )
})
