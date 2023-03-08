import {createContext} from "react";
import {store} from "../store";

export const entitiesContext = createContext(store.entities);