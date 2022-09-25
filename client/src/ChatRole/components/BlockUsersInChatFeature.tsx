import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Checkbox, FormControlLabel} from "@mui/material";
import {DefaultChatFeature} from "./DefaultChatFeature";
import {useLocalization} from "../../store";
import {BlockUsersFeatureData} from "../../api/types/response";

interface BlockUsersInChatFeatureProps {
    feature: BlockUsersFeatureData
}

export const BlockUsersInChatFeature: FunctionComponent<BlockUsersInChatFeatureProps> = observer(({
    feature
}) => {
    const {l} = useLocalization();

    return (
        <Fragment>
            <DefaultChatFeature name={l("chat.feature.blockUsers")} feature={feature}/>
            <FormControlLabel control={<Checkbox checked={feature.enabled}/>}
                              label={l("chat.feature.blockUsers.allowPermanent")}
            />
        </Fragment>
    );
});
