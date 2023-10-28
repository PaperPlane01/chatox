import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useLocalization} from "../../store";
import {Labels} from "../types";

interface TranslatedTextProps {
    label: keyof Labels,
    bindings?: object
}

export const TranslatedText: FunctionComponent<TranslatedTextProps> = observer(({
    label,
    bindings
}) => {
    const {l} = useLocalization();

    return (
        <Fragment>
            {l(label, bindings)}
        </Fragment>
    );
});
