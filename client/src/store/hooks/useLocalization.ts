import {useContext} from "react";
import {localizationContext} from "../context";

export const useLocalization = () => useContext(localizationContext);
