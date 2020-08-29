import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControlLabel, Switch} from "@material-ui/core";
import {useLocalization, useStore} from "../../store/hooks";

export const UseEmojiCodesSwitch: FunctionComponent = observer(() => {
    const {
        emoji: {
            useEmojiCodes,
            setUseEmojiCodes
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <FormControlLabel control={
            <Switch checked={useEmojiCodes}
                    onChange={() => setUseEmojiCodes(!useEmojiCodes)}
            />
        }
                          label={l("emoji.use-codes")}
        />
    )
});
