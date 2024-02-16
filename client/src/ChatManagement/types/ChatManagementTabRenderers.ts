import {ReactNode} from "react";
import {ChatManagementTab} from "./ChatManagementTab";
import {BaseSettingsTabProps} from "../../utils/types";

export type ChatManagementTabRenderers = {
    [Tab in keyof typeof ChatManagementTab]: (props: BaseSettingsTabProps) => ReactNode
};
