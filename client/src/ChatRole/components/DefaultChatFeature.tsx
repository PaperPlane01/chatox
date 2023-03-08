import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Checkbox, FormControlLabel, Typography} from "@mui/material";
import {useLocalization} from "../../store";
import {ChatFeatureData} from "../../api/types/response";

interface DefaultChatFeatureProps {
    name: string,
    feature: ChatFeatureData
}

export const DefaultChatFeature: FunctionComponent<DefaultChatFeatureProps> = observer(({
    name,
    feature
}) => {
    const {l} = useLocalization();

    return (
       <Fragment>
           <Typography>
               <b>
                   {name}
               </b>
           </Typography>
           <FormControlLabel control={<Checkbox checked={feature.enabled}/>}
                             label={l("common.enabled")}
           />
       </Fragment>
    );
});
