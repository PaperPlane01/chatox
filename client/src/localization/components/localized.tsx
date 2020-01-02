import React, {Component, ComponentType, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Labels} from "../types";
import {IAppState} from "../../store";
import {replacePlaceholder} from "../utils";

export interface Localized {
    l: (label: keyof Labels, bindings?: any) => string
}

interface LocalizedMobxProps {
    currentLabels: Labels
}

const mapMobxToProps = (state: IAppState): LocalizedMobxProps => ({
    currentLabels: state.language.currentLanguageLabels
});

export const localized = <T extends Localized>(
    WrappedComponent: ComponentType<T>
): FunctionComponent<T & LocalizedMobxProps> => {
    return inject(mapMobxToProps)(observer((props: T & LocalizedMobxProps) => {
        const getLabel = (labelKey: keyof Labels, bindings?: any): string => {
            const {currentLabels} = props;
            let label = currentLabels[labelKey];

            if (bindings) {
                label = replacePlaceholder(label, bindings);
            }

            return label;
        };

        return <WrappedComponent l={getLabel} {...props}/>
    }))
};
