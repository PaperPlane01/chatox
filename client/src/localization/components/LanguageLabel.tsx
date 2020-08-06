import React, {FunctionComponent, Fragment} from "react";
import {Typography} from "@material-ui/core";

interface LanguageLabelProps {
    languageLabel: string,
    nativeLanguageLabel: string
}

export const LanguageLabel: FunctionComponent<LanguageLabelProps> = ({languageLabel, nativeLanguageLabel}) => (
    <Fragment>
        <Typography>
            <strong>
                {nativeLanguageLabel}
            </strong>
        </Typography>
        <Typography color="textSecondary">
            {languageLabel}
        </Typography>
    </Fragment>
);
