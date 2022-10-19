import React, {FunctionComponent} from "react";
import {useSnackbar, WithSnackbarProps, VariantType} from "notistack";

interface InternalSnackbarManagerProps {
    setUseSnackbarRef: (props: WithSnackbarProps) => void
}

const InternalSnackbarManager: FunctionComponent<InternalSnackbarManagerProps> = ({
    setUseSnackbarRef
}) => {
    setUseSnackbarRef(useSnackbar());
    return null;
}

let useSnackbarRef: WithSnackbarProps;
const setUserSnackbarRef = (props: WithSnackbarProps): void => {
    useSnackbarRef = props;
};

export const SnackbarManager: FunctionComponent = () => (
    <InternalSnackbarManager setUseSnackbarRef={setUserSnackbarRef}/>
);

export const INTERNAL_ENQUEUE_SNACKBAR = (message: string, variant: VariantType = "default"): void => {
    useSnackbarRef.enqueueSnackbar(message, {variant});
}