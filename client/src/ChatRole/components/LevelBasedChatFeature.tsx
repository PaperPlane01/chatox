import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
import {DefaultChatFeature} from "./DefaultChatFeature";
import {useLocalization} from "../../store";
import {LevelBasedChatFeatureData} from "../../api/types/response";
import {isDefined} from "../../utils/object-utils";

interface LevelBasedChatFeatureProps {
    name: string,
    feature: LevelBasedChatFeatureData
}

export const LevelBasedChatFeature: FunctionComponent<LevelBasedChatFeatureProps> = observer(({
    feature,
    name
}) => {
    const {l} = useLocalization();

    return (
        <Fragment>
            <DefaultChatFeature name={name} feature={feature}/>
            {feature.enabled && (
                <Fragment>
                    <Typography>
                        {l("chat.feature.additional.fromLevel")}
                        :
                        {isDefined(feature.additional.fromLevel) ? feature.additional.fromLevel : "-"}
                    </Typography>
                    <Typography>
                        {l("chat.feature.additional.upToLevel")}
                        :
                        {isDefined(feature.additional.upToLevel) ? feature.additional.upToLevel : "-"}
                    </Typography>
                </Fragment>
            )}
        </Fragment>
    );
});
