import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Typography, TypographyProps} from "@mui/material";
import {Labels} from "../types";
import {useLocalization} from "../../store";

interface TranslatedTypographyProps extends TypographyProps {
    label: keyof Labels,
    bindings?: object
}

export const TranslatedTypography: FunctionComponent<TranslatedTypographyProps> = observer(({
    label,
    bindings,
    ...rest
}) => {
    const {l} = useLocalization();

    return (
        <Typography {...rest}>
            {l(label, bindings)}
        </Typography>
    );
});
