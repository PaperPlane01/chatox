import React, {FunctionComponent} from "react";
import {SvgIcon, SvgIconProps} from "@material-ui/core";

export const Pin: FunctionComponent<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
    </SvgIcon>
);
