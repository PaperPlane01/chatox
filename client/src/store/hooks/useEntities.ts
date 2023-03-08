import {useContext} from "react";
import {entitiesContext} from "../context/entities-context";

export const useEntities = () => useContext(entitiesContext);