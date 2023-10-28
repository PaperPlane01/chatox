import {ReactNode} from "react";
import {ChatManagementTab} from "./ChatManagementTab";

export type ChatManagementMenuItemRenderers = {
    [Tab in keyof typeof ChatManagementTab]: ReactNode
};
