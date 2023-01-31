import {createContext} from "react";
import {rootStore} from "../root-store";

export const routerContext = createContext(rootStore.router);
