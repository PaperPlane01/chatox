import React, {FunctionComponent, Fragment} from "react";
import {Typography} from "@mui/material";

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
